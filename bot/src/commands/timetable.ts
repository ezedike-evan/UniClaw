import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function timetableCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Timetable question: ${extra}`
    : "Give me a concise summary of how the UNILAG course timetable works, where students find it, and any key tips.";
  await handleAsk(ctx, prompt);
}
