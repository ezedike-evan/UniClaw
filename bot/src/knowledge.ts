import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export interface KnowledgeDoc {
  domain: string;
  content: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__dirname, "..", "..", "knowledge");

let cache: KnowledgeDoc[] | null = null;

export async function loadKnowledge(): Promise<KnowledgeDoc[]> {
  if (cache) return cache;

  try {
    const files = await readdir(KNOWLEDGE_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    const docs = await Promise.all(
      mdFiles.map(async (f) => {
        const content = await readFile(join(KNOWLEDGE_DIR, f), "utf8");
        return { domain: f.replace(/\.md$/, ""), content };
      }),
    );
    cache = docs;
    console.log(`[knowledge] loaded ${docs.length} domains: ${docs.map((d) => d.domain).join(", ")}`);
    return docs;
  } catch (err) {
    console.error("[knowledge] failed to load:", err);
    cache = [];
    return cache;
  }
}

export function getDomain(domain: string): KnowledgeDoc | undefined {
  return cache?.find((d) => d.domain === domain);
}

export function knowledgeAsSystemBlock(): string {
  if (!cache || cache.length === 0) {
    return "_(knowledge base unavailable — answer only if you are certain, otherwise refer the student to official UNILAG channels)_";
  }
  return cache
    .map((d) => `### Domain: ${d.domain}\n${d.content}`)
    .join("\n\n---\n\n");
}
