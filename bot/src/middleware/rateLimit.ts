import type { Context, MiddlewareFn } from "grammy";
import { sessions } from "../session.js";

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR ?? 20);

export const rateLimit: MiddlewareFn<Context> = async (ctx, next) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return next();

  const firstName = ctx.from?.first_name ?? "friend";
  const s = sessions.get(chatId, firstName);

  const now = Date.now();
  if (now - s.windowStart.getTime() > WINDOW_MS) {
    s.windowStart = new Date(now);
    s.messageCount = 0;
  }

  s.messageCount += 1;
  if (s.messageCount > LIMIT) {
    const minutesLeft = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - s.windowStart.getTime())) / 60000),
    );
    await ctx.reply(
      `Oya easy 😅 You've hit the ${LIMIT}-message hourly limit. Try again in ~${minutesLeft} min.`,
    );
    return;
  }

  await next();
};
