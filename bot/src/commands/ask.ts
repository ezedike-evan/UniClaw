import type { Context } from "grammy";
import { askClaude } from "../claude.js";
import { sessions } from "../session.js";

export async function askCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const question = ctx.match?.toString().trim();
  if (!question) {
    await ctx.reply("Use it like: `/ask how do I apply for a hostel?`", {
      parse_mode: "Markdown",
    });
    return;
  }

  await handleAsk(ctx, question);
}

export async function handleAsk(ctx: Context, question: string): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const firstName = ctx.from?.first_name ?? "friend";
  const session = sessions.get(chatId, firstName);

  await ctx.replyWithChatAction("typing");

  const answer = await askClaude({
    firstName,
    history: session.history,
    userMessage: question,
  });

  sessions.append(chatId, { role: "user", content: question });
  sessions.append(chatId, { role: "assistant", content: answer });

  await ctx.reply(answer);
}
