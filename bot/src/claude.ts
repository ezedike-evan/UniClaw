import Anthropic from "@anthropic-ai/sdk";
import { knowledgeAsSystemBlock } from "./knowledge.js";
import type { ChatMessage } from "./session.js";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const FALLBACK_MESSAGE =
  "UniClaw is taking a quick breather 😅 Try again in a moment.";

function buildSystemPrompt(firstName: string): string {
  return `You are UniClaw, the official AI campus assistant for the University of Lagos (UNILAG).
You are helpful, friendly, and speak like a smart Nigerian student — not robotic.
You can use light Nigerian expressions naturally (e.g. "omo", "no wahala") but stay professional.

You have access to verified UNILAG knowledge across these domains:

${knowledgeAsSystemBlock()}

STRICT RULES:
- Only answer using verified data from the knowledge base above.
- Treat anything marked [VERIFY] as uncertain — do not state it as fact.
- If asked something not in your knowledge base, respond with:
  "I don't have that info yet — check the official UNILAG source or contribute it with /contribute"
- Never guess specific dates, fees, room numbers, or contacts.
- Always be concise — students are on mobile.
- If a student seems stressed (exams, registration issues), be empathetic first.

You are currently chatting with ${firstName}.`;
}

function toApiMessages(history: ChatMessage[]): Anthropic.MessageParam[] {
  const trimmed = history.slice(-10);
  return trimmed.map((m) => ({ role: m.role, content: m.content }));
}

export interface AskOptions {
  firstName: string;
  history: ChatMessage[];
  userMessage: string;
}

export async function askClaude({ firstName, history, userMessage }: AskOptions): Promise<string> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(firstName),
      messages: [
        ...toApiMessages(history),
        { role: "user", content: userMessage },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return text || FALLBACK_MESSAGE;
  } catch (err) {
    console.error("[claude] request failed:", err);
    return FALLBACK_MESSAGE;
  }
}

export async function* streamClaude({
  firstName,
  history,
  userMessage,
}: AskOptions): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(firstName),
      messages: [
        ...toApiMessages(history),
        { role: "user", content: userMessage },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  } catch (err) {
    console.error("[claude] stream failed:", err);
    yield FALLBACK_MESSAGE;
  }
}
