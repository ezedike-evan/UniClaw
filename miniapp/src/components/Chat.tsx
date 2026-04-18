import { useEffect, useRef, useState } from "react";
import { Chip, IconButton } from "@telegram-apps/telegram-ui";
import type { UseChat } from "../hooks/useChat";
import type { ChatMessage } from "../types";
import { Icon } from "./icons";

interface Props {
  chat: UseChat;
}

const QUICK_REPLIES = [
  "How do I apply for a hostel?",
  "What's on the exam timetable?",
  "Where can I eat on campus?",
  "Who handles course registration?",
];

const EMPTY_SUGGESTIONS = [
  { icon: "hostel" as const, text: "Where can I get a hostel?" },
  { icon: "exams" as const, text: "How do I check my exam results?" },
  { icon: "food" as const, text: "Best food spots near campus?" },
];

const FOLLOWUP_MAP: Record<string, string[]> = {
  hostel: ["How much is the hostel fee?", "Which halls are co-ed?", "How do I apply?"],
  exam: ["Where do I check my results?", "What's the grading system?", "How are carry-overs handled?"],
  food: ["Which spot is cheapest?", "What are the opening hours?", "Is there a cafeteria near Faculty of Science?"],
  registr: ["What's the deadline?", "How many units can I take?", "Where do I get my course form?"],
  event: ["When is the next event?", "How do I get involved?", "Who organises campus events?"],
  contact: ["What's the Dean's office number?", "Where is the admin block?", "Any 24/7 emergency contacts?"],
};

function getFollowUps(text: string): string[] {
  const t = text.toLowerCase();
  for (const [key, suggestions] of Object.entries(FOLLOWUP_MAP)) {
    if (t.includes(key)) return suggestions;
  }
  return ["Tell me more", "Give me contacts for this", "Any important deadlines?"];
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Inline markdown renderer ──────────────────────────────── */
function inlineFormat(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="md-code">{part.slice(1, -1)}</code>;
    return part;
  });
}

function renderMarkdown(text: string): JSX.Element {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];

  lines.forEach((line, i) => {
    if (!line.trim()) {
      elements.push(<div key={i} className="md-spacer" />);
    } else if (/^#{1,3}\s/.test(line)) {
      elements.push(
        <div key={i} className="md-heading">{inlineFormat(line.replace(/^#+\s/, ""))}</div>,
      );
    } else if (/^[-•*]\s/.test(line)) {
      elements.push(
        <div key={i} className="md-bullet">
          <span className="md-bullet-dot">•</span>
          <span>{inlineFormat(line.replace(/^[-•*]\s/, ""))}</span>
        </div>,
      );
    } else if (/^\d+\.\s/.test(line)) {
      const dotIdx = line.indexOf(". ");
      const num = line.slice(0, dotIdx + 1);
      const rest = line.slice(dotIdx + 2);
      elements.push(
        <div key={i} className="md-bullet">
          <span className="md-bullet-dot">{num}</span>
          <span>{inlineFormat(rest)}</span>
        </div>,
      );
    } else {
      elements.push(<div key={i} className="md-para">{inlineFormat(line)}</div>);
    }
  });

  return <div className="md-content">{elements}</div>;
}

/* ── Typing indicator ────────────────────────────────────────── */
function TypingIndicator(): JSX.Element {
  return (
    <div className="typing-row" aria-label="UniClaw is typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ── Single bubble ───────────────────────────────────────────── */
function Bubble({
  msg,
  onCopy,
  copiedId,
}: {
  msg: ChatMessage;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
}): JSX.Element {
  const isUser = msg.role === "user";
  const isCopied = copiedId === msg.id;

  return (
    <div className={`bubble-row ${isUser ? "user" : "bot"}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        {msg.content ? (
          isUser ? (
            <span>{msg.content}</span>
          ) : (
            renderMarkdown(msg.content)
          )
        ) : msg.pending ? (
          <TypingIndicator />
        ) : null}
      </div>

      {!isUser && msg.content && !msg.pending && (
        <div className="bubble-actions">
          <button
            type="button"
            className={`bubble-action-btn ${isCopied ? "copied" : ""}`}
            aria-label="Copy"
            onClick={() => onCopy(msg.id, msg.content)}
          >
            <Icon name={isCopied ? "check" : "copy"} size={14} />
          </button>
          <button
            type="button"
            className="bubble-action-btn"
            aria-label="Share"
            onClick={() => onCopy(msg.id, msg.content)}
          >
            <Icon name="share" size={14} />
          </button>
        </div>
      )}

      {msg.timestamp && (
        <span className="bubble-time">{formatTime(msg.timestamp)}</span>
      )}
    </div>
  );
}

/* ── Main Chat component ─────────────────────────────────────── */
export function Chat({ chat }: Props): JSX.Element {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat.messages]);

  const submit = async (text: string): Promise<void> => {
    const value = text.trim();
    if (!value || chat.sending) return;
    setInput("");
    await chat.send(value);
  };

  const handleCopy = (id: string, text: string): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  /* Last completed bot message for follow-up chips */
  const lastBot = [...chat.messages].reverse().find(
    (m) => m.role === "assistant" && !m.pending && m.content,
  );
  const followUps = lastBot ? getFollowUps(lastBot.content) : null;

  return (
    <div className="chat-screen">
      {/* ── HEADER ── */}
      <div className="chat-header">
        <div className="chat-header-avatar">UC</div>
        <div className="chat-header-info">
          <div className="chat-header-name">UniClaw</div>
          <div className="chat-header-status">
            <span className="online-dot" />
            <span>{chat.sending ? "Thinking…" : "Online · UNILAG assistant"}</span>
          </div>
        </div>
        {chat.hasHistory && (
          <button
            type="button"
            className="chat-header-btn"
            aria-label="Clear chat"
            onClick={chat.reset}
            title="Clear chat"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef} className="chat-scroll">
        {chat.messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <Icon name="sparkles" size={52} />
            </div>
            <h2 className="chat-empty-title">UniClaw is listening</h2>
            <p className="chat-empty-sub">
              Ask about hostels, courses, events, food, contacts — anything UNILAG.
            </p>
            <div className="chat-empty-suggestions">
              {EMPTY_SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  className="chat-empty-suggestion"
                  onClick={() => void submit(s.text)}
                >
                  <Icon name={s.icon} size={18} />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chat.hasHistory && chat.messages.length > 0 && (
              <div className="chat-history-banner">
                <span>Continuing your last conversation</span>
                <button
                  type="button"
                  className="chat-history-clear"
                  onClick={chat.reset}
                >
                  Clear
                </button>
              </div>
            )}

            {chat.messages.map((m) => (
              <Bubble key={m.id} msg={m} onCopy={handleCopy} copiedId={copiedId} />
            ))}

            {/* Follow-up chips after last bot reply */}
            {followUps && !chat.sending && (
              <div className="follow-up-row">
                {followUps.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="follow-up-chip"
                    onClick={() => void submit(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="chat-footer">
        <div className="chip-row">
          {QUICK_REPLIES.map((q) => (
            <Chip
              key={q}
              mode="elevated"
              onClick={() => void submit(q)}
              disabled={chat.sending}
            >
              {q}
            </Chip>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
          className="chat-input-row"
        >
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask UniClaw anything…"
            disabled={chat.sending}
            autoComplete="off"
          />
          <IconButton
            type="submit"
            mode="bezeled"
            size="l"
            disabled={chat.sending || !input.trim()}
            aria-label="Send"
          >
            <Icon name="send" size={18} />
          </IconButton>
        </form>

        <p className="chat-footnote">Powered by Claude · Grounded by UNILAG knowledge base</p>
      </div>
    </div>
  );
}
