import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, TelegramUser } from "../types";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3000";

const STORAGE_KEY = "uc_messages";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.filter((m) => !m.pending).slice(-20);
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    const toSave = msgs.filter((m) => !m.pending).slice(-20);
    if (toSave.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  } catch {}
}

export interface UseChat {
  messages: ChatMessage[];
  sending: boolean;
  send: (content: string) => Promise<void>;
  reset: () => void;
  seed: (content: string) => void;
  hasHistory: boolean;
}

export function useChat(user: TelegramUser | null): UseChat {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setSending(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const seed = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content, pending: false, timestamp: Date.now() },
    ]);
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      const botId = uid();
      const botMsg: ChatMessage = {
        id: botId,
        role: "assistant",
        content: "",
        pending: true,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setSending(true);

      const chatId = user?.id ?? -1;
      const firstName = user?.first_name ?? "friend";

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, firstName, message: trimmed }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, pending: false } : m,
                ),
              );
              continue;
            }
            try {
              const { delta } = JSON.parse(payload) as { delta: string };
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId
                    ? { ...m, content: m.content + delta, pending: true }
                    : m,
                ),
              );
            } catch {
              /* ignore malformed chunk */
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, pending: false } : m)),
        );
      } catch (err) {
        console.error("chat stream error", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  pending: false,
                  content:
                    m.content ||
                    "UniClaw is taking a quick breather 😅 Try again in a moment.",
                }
              : m,
          ),
        );
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [sending, user],
  );

  return { messages, sending, send, reset, seed, hasHistory: messages.length > 0 };
}
