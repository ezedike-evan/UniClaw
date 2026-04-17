import type { Context } from "grammy";
import { handleAsk } from "./ask.js";

export async function examsCommand(ctx: Context): Promise<void> {
  const extra = ctx.match?.toString().trim();
  const prompt = extra
    ? `Exams question: ${extra}`
    : "Summarize the current UNILAG exam schedule, results portal, and any tips for students who are stressed about exams.";
  await handleAsk(ctx, prompt);
}
