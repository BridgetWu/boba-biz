import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const repoRoot = path.resolve(currentDir, "..", "..");
const envCandidates = [
  path.join(repoRoot, ".env.local"),
  path.join(repoRoot, ".env"),
  path.join(currentDir, "..", ".env.local"),
  path.join(currentDir, "..", ".env"),
];

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return;
  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

for (const envPath of envCandidates) {
  loadEnvFile(envPath);
}

const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = "gemini-3.5-flash";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": clientOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && typeof message.content === "string")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }))
    .filter((message) => message.parts[0].text.length > 0);
}

function getAssistantPrompt() {
  return [
    "You are a helpful AI assistant for this website.",
    "Answer questions about the website and guide users through available features. If the question is unrelated to the shop, reply with 'I’m sorry, I cannot answer the question.'",
    "Customer question:",
  ].join(" ");
}

function extractTextFromGeminiPayload(payload) {
  if (!payload || typeof payload !== "object") return "";

  if (typeof payload.text === "string") {
    return payload.text;
  }

  const candidateTexts =
    payload.candidates?.flatMap((candidate) => {
      const parts = candidate?.content?.parts;
      if (!Array.isArray(parts)) return [];
      return parts.map((part) => part?.text ?? "");
    }) ?? [];

  return candidateTexts.join("");
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": clientOrigin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
    return res.end();
  }

  if (req.method !== "POST" || requestUrl.pathname !== "/api/chat") {
    return sendJson(res, 404, { error: "Not found." });
  }

  if (!geminiApiKey) {
    return sendJson(res, 500, { error: "Gemini API key is not configured." });
  }

  let rawBody = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 32 * 1024) {
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const body = rawBody ? JSON.parse(rawBody) : {};
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      const messages = normalizeMessages(body.messages);
      const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

      if (!lastUserMessage) {
        return sendJson(res, 400, { error: "At least one user message is required." });
      }

      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: getAssistantPrompt() }],
          },
          contents: messages,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!upstream.ok || !upstream.body) {
        const errorText = await upstream.text().catch(() => "");
        console.error("Gemini API error:", upstream.status, errorText);
        return sendJson(res, 502, { error: "The AI assistant is unavailable right now." });
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedText = "";
      let responseStarted = false;

      const startStream = () => {
        if (responseStarted) return;
        responseStarted = true;
        res.writeHead(200, {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Access-Control-Allow-Origin": clientOrigin,
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Append new chunks to our string buffer
        buffer += decoder.decode(value, { stream: true });

        // Split by single newlines to process line-by-line safely
        const lines = buffer.split("\n");
        // Save the last incomplete line back into the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          // Skip empty lines or comments
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const text = extractTextFromGeminiPayload(parsed);
            if (text) {
              startStream();
              res.write(text);
              streamedText += text;
            }
          } catch (err) {
            // Log parsing errors if needed during debugging
            console.error("Failed to parse SSE data line:", err);
          }
        }
      }

      // Final check: if there's any remaining data left in the buffer after the stream closes
      if (buffer.trim().startsWith("data:")) {
        try {
          const data = buffer.trim().slice(5).trim();
          if (data && data !== "[DONE]") {
            const parsed = JSON.parse(data);
            const text = extractTextFromGeminiPayload(parsed);
            if (text) {
              startStream();
              res.write(text);
              streamedText += text;
            }
          }
        } catch {
          // Ignore trailing noise
        }
      }

      if (!streamedText.trim()) {
        console.error("Gemini stream returned no usable text.");
        if (!responseStarted) {
          return sendJson(res, 502, { error: "The AI assistant is unavailable right now." });
        }
      }

      return res.end();
    } catch (error) {
      console.error("Chat API error:", error);
      return sendJson(res, 500, { error: "Internal server error." });
    }
  });
});

server.listen(port, () => {
  console.log(`Chat API server listening on http://localhost:${port}`);
});
