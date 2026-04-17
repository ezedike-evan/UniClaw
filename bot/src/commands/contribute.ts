import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { InlineKeyboard, type Context } from "grammy";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(__dirname, "..", "..", "contributions.log.json");

export interface Contribution {
  id: string;
  chatId: number;
  username?: string;
  category: string;
  content: string;
  submittedAt: string;
}

const CATEGORIES = [
  "registration",
  "hostels",
  "faculties",
  "events",
  "exams",
  "food",
  "contacts",
  "campus-map",
];

const pendingCategory = new Map<number, string | null>();

export async function contributeCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const keyboard = new InlineKeyboard();
  CATEGORIES.forEach((cat, i) => {
    keyboard.text(cat, `contribute:${cat}`);
    if (i % 2 === 1) keyboard.row();
  });

  pendingCategory.set(chatId, null);

  await ctx.reply(
    "🙌 Thanks for helping UniClaw get better!\n\nWhich category is this about?",
    { reply_markup: keyboard },
  );
}

export async function handleContributeCallback(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const data = ctx.callbackQuery?.data;
  if (!chatId || !data?.startsWith("contribute:")) return;

  const category = data.slice("contribute:".length);
  pendingCategory.set(chatId, category);

  await ctx.answerCallbackQuery();
  await ctx.reply(
    `Got it — *${category}*.\n\nNow send me the info you want to contribute. Be specific (names, times, fees, links).`,
    { parse_mode: "Markdown" },
  );
}

export async function maybeHandleContribution(ctx: Context): Promise<boolean> {
  const chatId = ctx.chat?.id;
  if (!chatId) return false;
  const category = pendingCategory.get(chatId);
  if (!category) return false;

  const content = ctx.message?.text?.trim();
  if (!content) return false;

  const entry: Contribution = {
    id: `${Date.now()}-${chatId}`,
    chatId,
    username: ctx.from?.username,
    category,
    content,
    submittedAt: new Date().toISOString(),
  };

  await appendContribution(entry);
  pendingCategory.delete(chatId);

  await ctx.reply(
    "✅ Submitted! An admin will review and add it to the knowledge base. Omo, thank you 🙏",
  );
  return true;
}

async function appendContribution(entry: Contribution): Promise<void> {
  let existing: Contribution[] = [];
  try {
    const raw = await readFile(LOG_PATH, "utf8");
    existing = JSON.parse(raw);
  } catch {
    existing = [];
  }
  existing.push(entry);
  await writeFile(LOG_PATH, JSON.stringify(existing, null, 2), "utf8");
}

export async function acceptHttpContribution(entry: Omit<Contribution, "id" | "submittedAt">): Promise<Contribution> {
  const full: Contribution = {
    ...entry,
    id: `${Date.now()}-${entry.chatId}`,
    submittedAt: new Date().toISOString(),
  };
  await appendContribution(full);
  return full;
}

