import { useState, type FormEvent } from "react";
import type { TelegramUser } from "../types";
import { Icon } from "./icons";

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
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://localhost:3000";

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
      <div className="contribute-thankyou">
        <div className="thank-icon">
          <Icon name="sparkles" size={56} />
        </div>
        <h2 className="uc-title">Thank you</h2>
        <p className="uc-body">
          An admin will review your submission. UniClaw gets smarter thanks to
          students like you.
        </p>
        <button type="button" className="uc-button" onClick={reset}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="contribute-form">
      <section className="uc-section">
        <h2 className="uc-section-header">Contribute</h2>
        <div className="uc-card">
          <label className="uc-field">
            <span className="uc-field-label">Category</span>
            <select
              className="uc-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="uc-field">
            <span className="uc-field-label">What do you want to contribute?</span>
            <textarea
              className="uc-textarea"
              placeholder="Be specific — names, times, fees, URLs…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </label>
        </div>
        <p className="uc-section-footer">
          Help UniClaw stay accurate. Submissions are reviewed before they go
          live.
        </p>
      </section>

      <div className="contribute-submit">
        {error && <p className="uc-error">{error}</p>}
        <button
          type="submit"
          className="uc-button"
          disabled={submitting || !content.trim()}
        >
          {submitting ? "Submitting…" : "Submit contribution"}
        </button>
      </div>
    </form>
  );
}
