import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  date: string;   // human-readable, e.g. "Apr 17"
  isoDate: string;
  categories: string[];
}

const FEED_URL = "https://unilag.edu.ng/feed/";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const parser = new Parser({ timeout: 10_000 });

let cache: { items: NewsItem[]; fetchedAt: number } | null = null;

export async function fetchNews(): Promise<NewsItem[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const feed = await parser.parseURL(FEED_URL);

  const items: NewsItem[] = (feed.items ?? []).map((item) => {
    const raw = item.isoDate ?? item.pubDate ?? "";
    const date = raw
      ? new Date(raw).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
      : "";

    return {
      title: (item.title ?? "Untitled").trim(),
      link: item.link ?? item.guid ?? "",
      date,
      isoDate: raw,
      categories: (item.categories ?? []).map((c) => c.toLowerCase()),
    };
  });

  cache = { items, fetchedAt: now };
  console.log(`[feeds] fetched ${items.length} items from UNILAG RSS`);
  return items;
}

/* Faculty keyword → RSS category substrings that indicate a match */
const FACULTY_ALIASES: Record<string, string[]> = {
  engineering:           ["engineering"],
  science:               ["faculty of science", "science students"],
  medicine:              ["medicine", "clinical sciences", "basic medical"],
  law:                   ["law"],
  arts:                  ["arts"],
  computing:             ["computing"],
  education:             ["education"],
  pharmacy:              ["pharmacy"],
  "social sciences":     ["social sciences", "social science"],
  "management sciences": ["management sciences", "management science", "business"],
  "environmental sciences": ["environmental"],
  dental:                ["dental"],
};

export function filterByFaculty(items: NewsItem[], faculty: string): NewsItem[] {
  const key = faculty.toLowerCase().replace(/^faculty of\s*/i, "").trim();

  /* Find matching alias list; fall back to a direct substring scan */
  const aliases = FACULTY_ALIASES[key] ?? [key];

  return items.filter((item) =>
    item.categories.some((cat) => aliases.some((alias) => cat.includes(alias))) ||
    item.title.toLowerCase().includes(key),
  );
}
