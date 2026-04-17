import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function eventsCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Events question: ${extra}`
    : "What campus events at UNILAG are currently happening or coming up soon? Keep it short and practical.";
  await handleAsk(ctx, prompt);
}
