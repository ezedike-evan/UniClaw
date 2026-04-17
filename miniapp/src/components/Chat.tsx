import { useEffect, useRef, useState } from "react";
import type { UseChat } from "../hooks/useChat";
import type { ChatMessage } from "../types";

interface Props {
  chat: UseChat;
}

const QUICK_REPLIES = [
  "How do I apply for a hostel?",
  "What's on the exam timetable?",
  "Where can I eat on campus?",
  "Who do I talk to about course registration?",
];

function TypingIndicator(): JSX.Element {
  return (
    <div className="flex gap-1 items-center py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }): JSX.Element {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
    >
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser ? "bubble-user" : "bubble-bot"
        }`}
      >
        {msg.content || (msg.pending ? <TypingIndicator /> : "")}
      </div>
    </div>
  );
}

export function Chat({ chat }: Props): JSX.Element {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages]);

  const submit = async (text: string): Promise<void> => {
    const value = text.trim();
    if (!value || chat.sending) return;
    setInput("");
    await chat.send(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 muted">
            <div className="text-5xl animate-logo-pulse">🦅</div>
            <div>
              <div className="font-semibold text-base text-[color:var(--uc-text)]">
                UniClaw is listening
              </div>
              <div className="text-sm mt-1 max-w-xs">
                Ask about hostels, courses, events, food, contacts — anything
                UNILAG.
              </div>
            </div>
          </div>
        ) : (
          chat.messages.map((m) => <Bubble key={m.id} msg={m} />)
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-2 flex-wrap mb-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => submit(q)}
              className="chip"
              disabled={chat.sending}
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
          className="glass-card flex items-center gap-2 px-3 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask UniClaw anything…"
            className="flex-1 bg-transparent outline-none text-sm py-1 placeholder:text-[color:var(--uc-muted)]"
            disabled={chat.sending}
          />
          <button
            type="submit"
            disabled={chat.sending || !input.trim()}
            className="h-9 px-4 rounded-full font-semibold text-sm text-white disabled:opacity-50 transition"
            style={{ background: "linear-gradient(135deg,#d97706,#f97316)" }}
          >
            Send
          </button>
        </form>
        <p className="text-[10px] text-center muted mt-1.5">
          Powered by Claude · Grounded by UNILAG knowledge base
        </p>
      </div>
    </div>
  );
}
