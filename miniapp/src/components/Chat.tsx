import { useEffect, useRef, useState } from "react";
import {
  Caption,
  Chip,
  IconButton,
  Input,
  Placeholder,
} from "@telegram-apps/telegram-ui";
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

function TypingIndicator(): JSX.Element {
  return (
    <div className="typing-row" aria-label="UniClaw is typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }): JSX.Element {
  const isUser = msg.role === "user";
  return (
    <div className={`bubble-row ${isUser ? "user" : "bot"}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        {msg.content ? (
          <span>{msg.content}</span>
        ) : msg.pending ? (
          <TypingIndicator />
        ) : null}
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
    <div className="chat-screen">
      <div ref={scrollRef} className="chat-scroll">
        {chat.messages.length === 0 ? (
          <Placeholder
            header="UniClaw is listening"
            description="Ask about hostels, courses, events, food, contacts — anything UNILAG."
          >
            <div className="chat-empty-icon">
              <Icon name="sparkles" size={48} />
            </div>
          </Placeholder>
        ) : (
          chat.messages.map((m) => <Bubble key={m.id} msg={m} />)
        )}
      </div>

      <div className="chat-footer">
        <div className="chip-row">
          {QUICK_REPLIES.map((q) => (
            <Chip
              key={q}
              mode="elevated"
              onClick={() => submit(q)}
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
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask UniClaw anything…"
            disabled={chat.sending}
          />
          <IconButton
            type="submit"
            mode="filled"
            size="l"
            disabled={chat.sending || !input.trim()}
            aria-label="Send"
          >
            <Icon name="send" size={18} />
          </IconButton>
        </form>

        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <Caption level="1" style={{ opacity: 0.5 }}>
            Powered by Claude · Grounded by UNILAG knowledge base
          </Caption>
        </div>
      </div>
    </div>
  );
}
