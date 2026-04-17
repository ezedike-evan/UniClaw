import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function contactsCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Contacts question: ${extra}`
    : "Give me the key UNILAG contacts a student typically needs — faculty offices, student affairs, bursary, medical centre, security.";
  await handleAsk(ctx, prompt);
}
