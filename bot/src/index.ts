import "dotenv/config";
import { Bot, GrammyError, HttpError } from "grammy";
import express from "express";
import cors from "cors";

import { loadKnowledge } from "./knowledge.js";
import { sessions } from "./session.js";
import { askClaude, streamClaude, FALLBACK_MESSAGE } from "./claude.js";
import { rateLimit } from "./middleware/rateLimit.js";

import { startCommand, helpCommand } from "./commands/start.js";
import { askCommand, handleAsk } from "./commands/ask.js";
import { timetableCommand } from "./commands/timetable.js";
import { hostelCommand } from "./commands/hostel.js";
import { eventsCommand } from "./commands/events.js";
import { examsCommand } from "./commands/exams.js";
import { foodCommand } from "./commands/food.js";
import { contactsCommand } from "./commands/contacts.js";
import {
  contributeCommand,
  handleContributeCallback,
  maybeHandleContribution,
  acceptHttpContribution,
} from "./commands/contribute.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is required");
  process.exit(1);
}

async function main(): Promise<void> {
  await loadKnowledge();

  const bot = new Bot(BOT_TOKEN!);

  bot.use(rateLimit);

  bot.command("start", startCommand);
  bot.command("help", helpCommand);
  bot.command("ask", askCommand);
  bot.command("timetable", timetableCommand);
  bot.command("hostel", hostelCommand);
  bot.command("events", eventsCommand);
  bot.command("exams", examsCommand);
  bot.command("food", foodCommand);
  bot.command("contacts", contactsCommand);
  bot.command("contribute", contributeCommand);

  bot.callbackQuery(/^contribute:/, handleContributeCallback);

  bot.callbackQuery(/^prompt:/, async (ctx) => {
    const topic = ctx.callbackQuery.data.slice("prompt:".length);
    await ctx.answerCallbackQuery();
    const prompts: Record<string, string> = {
      ask: "What would you like to ask me about UNILAG?",
      hostel: "Tell me about UNILAG hostels — options, fees, how to apply.",
      food: "What are the best food spots around UNILAG?",
      events: "What's happening on campus right now?",
    };
    await handleAsk(ctx, prompts[topic] ?? "Tell me about UNILAG.");
  });

  bot.on("message:text", async (ctx, next) => {
    if (await maybeHandleContribution(ctx)) return;

    const text = ctx.message.text;
    if (text.startsWith("/")) return next();

    // Group chat: respond only when @mentioned
    const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
    if (isGroup) {
      const me = ctx.me.username;
      const mentioned = text.includes(`@${me}`);
      if (!mentioned) return;
      const cleaned = text.replace(new RegExp(`@${me}`, "gi"), "").trim();
      if (!cleaned) return;
      await handleAsk(ctx, cleaned);
      return;
    }

    await handleAsk(ctx, text);
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`[bot] error for update ${ctx.update.update_id}:`, err.error);
    if (err.error instanceof GrammyError) {
      console.error("[bot] request:", err.error.description);
    } else if (err.error instanceof HttpError) {
      console.error("[bot] http error:", err.error);
    }
  });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/chat", async (req, res) => {
    const { chatId, firstName, message } = req.body as {
      chatId?: number;
      firstName?: string;
      message?: string;
    };
    if (!chatId || !message) {
      res.status(400).json({ error: "chatId and message required" });
      return;
    }
    const session = sessions.get(chatId, firstName ?? "friend");
    const reply = await askClaude({
      firstName: session.firstName,
      history: session.history,
      userMessage: message,
    });
    sessions.append(chatId, { role: "user", content: message });
    sessions.append(chatId, { role: "assistant", content: reply });
    res.json({ reply });
  });

  app.post("/api/chat/stream", async (req, res) => {
    const { chatId, firstName, message } = req.body as {
      chatId?: number;
      firstName?: string;
      message?: string;
    };
    if (!chatId || !message) {
      res.status(400).json({ error: "chatId and message required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const session = sessions.get(chatId, firstName ?? "friend");
    let full = "";

    try {
      for await (const chunk of streamClaude({
        firstName: session.firstName,
        history: session.history,
        userMessage: message,
      })) {
        full += chunk;
        res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
      }
    } catch (err) {
      console.error("[api] stream error:", err);
      res.write(
        `data: ${JSON.stringify({ delta: FALLBACK_MESSAGE })}\n\n`,
      );
    }

    if (full) {
      sessions.append(chatId, { role: "user", content: message });
      sessions.append(chatId, { role: "assistant", content: full });
    }

    res.write("data: [DONE]\n\n");
    res.end();
  });

  app.post("/api/contribute", async (req, res) => {
    const { chatId, username, category, content } = req.body as {
      chatId?: number;
      username?: string;
      category?: string;
      content?: string;
    };
    if (!chatId || !category || !content) {
      res.status(400).json({ error: "chatId, category and content required" });
      return;
    }
    const entry = await acceptHttpContribution({
      chatId,
      username,
      category,
      content,
    });
    res.json({ ok: true, id: entry.id });
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`[api] listening on :${port}`);
  });

  bot.start({
    onStart: (info) => console.log(`[bot] @${info.username} is live`),
  });
}

main().catch((err) => {
  console.error("[bot] fatal:", err);
  process.exit(1);
});
