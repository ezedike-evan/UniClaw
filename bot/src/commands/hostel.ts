import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function hostelCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Hostel question: ${extra}`
    : "Summarize UNILAG hostel options: names, who they're for, fees, how to apply, and current availability if known.";
  await handleAsk(ctx, prompt);
}
