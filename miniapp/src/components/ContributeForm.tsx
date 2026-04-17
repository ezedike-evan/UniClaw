import { useState, type FormEvent } from "react";
import type { TelegramUser } from "../types";

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

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3000";

interface Props {
  user: TelegramUser | null;
}

export function ContributeForm({ user }: Props): JSX.Element {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = (): void => {
    setContent("");
    setDone(false);
    setError(null);
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: user?.id ?? -1,
          username: user?.username,
          category,
          content: content.trim(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Couldn't submit — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="p-4 pb-28 flex flex-col items-center text-center gap-4 pt-10">
        <div className="text-6xl animate-fade-in-up">🙌</div>
        <h2 className="text-xl font-bold">Thank you!</h2>
        <p className="muted max-w-xs text-sm">
          An admin will review your submission. UniClaw gets smarter thanks to
          students like you.
        </p>
        <button
          type="button"
          onClick={reset}
          className="glass-card px-4 py-2 text-sm font-medium"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-28 space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Contribute</h1>
        <p className="text-sm muted mt-1">
          Help UniClaw stay accurate. Submissions are reviewed before they go
          live.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <div className="glass-card p-3 space-y-1">
          <label className="text-xs font-medium muted" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent outline-none text-sm py-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="glass-card p-3 space-y-1">
          <label className="text-xs font-medium muted" htmlFor="content">
            What do you want to contribute?
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Be specific — names, times, fees, URLs…"
            className="w-full bg-transparent outline-none text-sm resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="w-full h-11 rounded-2xl font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "linear-gradient(135deg,#003b8e,#1d4ed8)" }}
        >
          {submitting ? "Submitting…" : "Submit contribution"}
        </button>
      </form>
    </div>
  );
}
