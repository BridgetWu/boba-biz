import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

app.use(cors({ origin: clientOrigin, credentials: true }));

// --- Stripe: Create Embedded Checkout Session ---
app.post("/api/create-dynamic-checkout", express.json(), async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cartItems must be a non-empty array." });
    }

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.priceInCents,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      ui_mode: "embedded",
      return_url: `${clientOrigin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// --- Stripe Webhook ---
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!stripeWebhookSecret) {
      return res.status(500).json({ error: "Webhook secret is not configured." });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook signature verification failed.` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Checkout session completed:", session.id, session.amount_total, session.currency);
    }

    res.json({ received: true });
  },
);

// --- Chat / AI ---
app.post("/api/chat", express.json(), async (req, res) => {
  if (!geminiApiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }

  try {
    const messages = normalizeMessages(req.body.messages);
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) {
      return res.status(400).json({ error: "At least one user message is required." });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: getAssistantPrompt() }] },
          contents: messages,
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => "");
      console.error("Gemini API error:", upstream.status, errorText);
      return res.status(502).json({ error: "The AI assistant is unavailable right now." });
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamedText = "";
    let responseStarted = false;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const text = extractTextFromGeminiPayload(parsed);
          if (text) {
            if (!responseStarted) responseStarted = true;
            res.write(text);
            streamedText += text;
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    if (!streamedText.trim() && !responseStarted) {
      return res.status(502).json({ error: "The AI assistant is unavailable right now." });
    }

    res.end();
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// --- Helper functions (unchanged from original) ---

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m.content === "string")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.trim() }],
    }))
    .filter((m) => m.parts[0].text.length > 0);
}

function getAssistantPrompt() {
  return [
    "You are a helpful AI assistant for this website.",
    "Answer questions about the website and guide users through available features. If the question is unrelated to the shop, reply with 'I'm sorry, I cannot answer the question.'",
    "Customer question:",
  ].join(" ");
}

function extractTextFromGeminiPayload(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.text === "string") return payload.text;
  const texts =
    payload.candidates?.flatMap((c) => {
      const parts = c?.content?.parts;
      return Array.isArray(parts) ? parts.map((p) => p?.text ?? "") : [];
    }) ?? [];
  return texts.join("");
}
