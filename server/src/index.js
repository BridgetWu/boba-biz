import { config as loadEnv } from "dotenv";
import cors from "cors";
import express from "express";
import { Resend } from "resend";
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

for (const envPath of envCandidates) {
  loadEnv({ path: envPath, override: false });
}

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const resendApiKey = process.env.RESEND_API_KEY;

// Allow the Vite frontend to call this API in development/production.
app.use(cors({ origin: clientOrigin }));
// Parse JSON request bodies for API routes.
app.use(express.json());

app.post("/api/contact", async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const ownerEmail = typeof req.body?.ownerEmail === "string" ? req.body.ownerEmail.trim() : "";

    if (!name || !email || !message || !ownerEmail) {
      return res.status(400).json({ error: "Missing required fields: name, email, message, ownerEmail." });
    }

    if (!resendApiKey) {
      return res.status(500).json({ error: "Email service is not configured." });
    }

    const resend = new Resend(resendApiKey);
    const sendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Tea Shop Contact <onboarding@resend.dev>",
      to: ownerEmail,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (sendResult.error) {
      console.error("Resend send error:", sendResult.error);
      return res.status(502).json({
        error: sendResult.error.message || "Failed to send email.",
      });
    }

    return res.status(200).json({ success: true, messageId: sendResult.data?.id ?? null });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Contact API server listening on http://localhost:${port}`);
});
