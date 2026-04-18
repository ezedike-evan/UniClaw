import type { Context } from "grammy";
import { fetchNews, filterByFaculty, type NewsItem } from "../feeds.js";
import { sessions } from "../session.js";

const MAX_ITEMS = 8;

function formatItem(item: NewsItem, index: number): string {
  const date = item.date ? ` — ${item.date}` : "";
  return `${index + 1}\\. [${escapeMarkdown(item.title)}](${item.link})${date}`;
}

/* Escape characters that break Telegram MarkdownV2 */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

export async function newsCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  await ctx.replyWithChatAction("typing");

  let items: NewsItem[];
  try {
    items = await fetchNews();
  } catch (err) {
    console.error("[news] fetch failed:", err);
    await ctx.reply(
      "Couldn't reach the UNILAG website right now. Try again in a moment.",
    );
    return;
  }

  if (items.length === 0) {
    await ctx.reply("No news found from the UNILAG website right now.");
    return;
  }

  /* Determine faculty filter: command arg → session faculty → none */
  const argFaculty = ctx.match?.toString().trim() ?? "";
  const sessionFaculty =
    sessions.get(chatId, ctx.from?.first_name ?? "friend").faculty ?? "";
  const faculty = argFaculty || sessionFaculty;

  let filtered = items;
  let filterLabel = "";

  if (faculty) {
    const narrowed = filterByFaculty(items, faculty);
    if (narrowed.length > 0) {
      filtered = narrowed;
      filterLabel = `_Filtered for: ${escapeMarkdown(faculty)}_\n\n`;
    } else {
      /* No faculty match — fall back to general with a note */
      filterLabel = `_No faculty\\-specific news for "${escapeMarkdown(faculty)}" — showing all:_\n\n`;
    }
  }

  const displayed = filtered.slice(0, MAX_ITEMS);
  const lines = displayed.map((item, i) => formatItem(item, i));

  const header = faculty
    ? `📰 *Latest UNILAG News*\n${filterLabel}`
    : `📰 *Latest UNILAG News*\n\n`;

  const footer =
    "\n\n_Updated every 30 min · Use /news \\[faculty\\] to filter_";

  await ctx.reply(header + lines.join("\n") + footer, {
    parse_mode: "MarkdownV2",
    link_preview_options: { is_disabled: true },
  });
}
