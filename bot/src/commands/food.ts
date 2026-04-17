import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function foodCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Food question: ${extra}`
    : "List the popular food spots around UNILAG campus with price range, what they're known for, and opening hours if known.";
  await handleAsk(ctx, prompt);
}
