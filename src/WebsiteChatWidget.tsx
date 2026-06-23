import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SiteConfig } from "./types";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const CHAT_STORAGE_KEY = "bobabiz-chat-session";
const CHAT_API_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

function getInitialMessages(shopName: string): ChatMessage[] {
  return [
    createMessage(
      "assistant",
      `Hi! I’m here to help with ${shopName}. Ask me about the menu, hours, ordering, or any website feature.`,
    ),
  ];
}

function getAssistantPrompt(): string {
  return [
    "You are a helpful AI assistant for this website.",
    "Answer questions about the website and guide users through available features. If the question is unrelated to the shop, reply with 'I’m sorry, I cannot answer the question.'",
    "Customer question:",
  ].join(" ");
}

export function WebsiteChatWidget({ config }: { config: SiteConfig }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages(config.shopName));
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      // If session storage is unavailable or corrupted, start fresh.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Session persistence is best-effort only.
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, typing]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const endpoint = `${CHAT_API_URL}/api/chat`;

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, createMessage("user", content)];
    const assistantMessage = createMessage("assistant", "");
    setMessages([...nextMessages, assistantMessage]);
    setDraft("");
    setError("");
    setIsSending(true);
    setTyping(true);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: getAssistantPrompt(),
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let sawText = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const nextText = decoder.decode(value, { stream: true });
        if (!nextText) continue;
        sawText = true;
        assistantText += nextText;
        setMessages((current) => current.map((message) => (message.id === assistantMessage.id ? { ...message, content: assistantText } : message)));
        setTyping(false);
      }

      if (!sawText && !assistantText) {
        throw new Error("The assistant did not return a response.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong while sending your message.";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? {
                ...item,
                content: "I’m sorry, I’m having trouble answering right now. Please try again in a moment.",
              }
            : item,
        ),
      );
    } finally {
      setTyping(false);
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages(getInitialMessages(config.shopName));
    setDraft("");
    setError("");
    setTyping(false);
    setIsSending(false);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  };

  return (
    <div className="chat-widget">
      {open ? (
        <section className="chat-widget__panel" aria-label="AI chat assistant">
          <header className="chat-widget__header">
            <div>
              <p className="chat-widget__eyebrow">AI assistant</p>
              <h2 className="chat-widget__title">{config.shopName || "Shop assistant"}</h2>
            </div>
            <div className="chat-widget__headerActions">
              <button type="button" className="chat-widget__textButton" onClick={resetChat}>
                Reset
              </button>
              <button type="button" className="chat-widget__iconButton" onClick={() => setOpen(false)} aria-label="Close chat">
                ×
              </button>
            </div>
          </header>

          <div className="chat-widget__messages" ref={viewportRef}>
            {messages.map((message) => (
              <article key={message.id} className={`chat-widget__message chat-widget__message--${message.role}`}>
                <div className="chat-widget__bubble">{message.content || (message.role === "assistant" && typing ? "Typing..." : "")}</div>
              </article>
            ))}
            {typing ? (
              <div className="chat-widget__typing" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          <form className="chat-widget__composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="chat-draft">
              Type your message
            </label>
            <textarea
              id="chat-draft"
              className="chat-widget__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about menu items, hours, delivery, or ordering..."
              rows={3}
            />
            {error ? <p className="chat-widget__error">{error}</p> : null}
            <button type="submit" className="chat-widget__send" disabled={isSending || !draft.trim()}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      ) : null}

      <button type="button" className="chat-widget__launcher" onClick={() => setOpen((value) => !value)} aria-label="Open chat assistant">
        <span className="chat-widget__launcherIcon">AI</span>
        <span className="chat-widget__launcherText">{open ? "Close" : "Chat"}</span>
      </button>
    </div>
  );
}
