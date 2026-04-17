import { InlineKeyboard, type Context } from "grammy";

export async function startCommand(ctx: Context): Promise<void> {
  const name = ctx.from?.first_name ?? "there";
  const miniApp = process.env.MINI_APP_URL;

  const keyboard = new InlineKeyboard();
  if (miniApp) {
    keyboard.webApp("🦅 Open UniClaw Mini App", miniApp).row();
  }
  keyboard
    .text("📚 Ask anything", "prompt:ask")
    .text("🏠 Hostels", "prompt:hostel")
    .row()
    .text("🍱 Food", "prompt:food")
    .text("📅 Events", "prompt:events");

  await ctx.reply(
    `Hey ${name} 👋\n\nI'm *UniClaw* — your AI campus assistant for UNILAG.\n\nAsk me about hostels, courses, events, food, contacts, exams — anything campus-related. I'll only answer from verified info, no wahala.\n\nTap the button below to open the full app, or just send me a message.`,
    { parse_mode: "Markdown", reply_markup: keyboard },
  );
}

export async function helpCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    [
      "*UniClaw commands*",
      "",
      "/ask [question] — ask me anything",
      "/timetable — course timetable info",
      "/hostel — hostel availability & fees",
      "/events — campus events",
      "/exams — exam schedules & results",
      "/food — food spots on campus",
      "/contacts — faculty & admin contacts",
      "/contribute — submit new info",
      "/help — show this list",
      "",
      "Or just send me a message — I'll figure it out.",
    ].join("\n"),
    { parse_mode: "Markdown" },
  );
}
