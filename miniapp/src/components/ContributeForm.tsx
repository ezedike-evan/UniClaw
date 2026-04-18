import { useState, type FormEvent } from "react";
import type { TelegramUser } from "../types";
import { Icon } from "./icons";

const CATEGORIES: Array<{ value: string; label: string; icon: React.ReactNode }> = [
  { value: "registration", label: "Registration", icon: <Icon name="timetable" size={14} /> },
  { value: "hostels",      label: "Hostels",      icon: <Icon name="hostel" size={14} /> },
  { value: "faculties",    label: "Faculties",    icon: <Icon name="faculties" size={14} /> },
  { value: "events",       label: "Events",       icon: <Icon name="events" size={14} /> },
  { value: "exams",        label: "Exams",        icon: <Icon name="exams" size={14} /> },
  { value: "food",         label: "Food",         icon: <Icon name="food" size={14} /> },
  { value: "contacts",     label: "Contacts",     icon: <Icon name="contacts" size={14} /> },
  { value: "campus-map",   label: "Campus map",   icon: <Icon name="map" size={14} /> },
];

const MAX_CHARS = 500;

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3000";

interface Props {
  user: TelegramUser | null;
  contributionCount: number;
  onContribute: () => void;
}

export function ContributeForm({ user, contributionCount, onContribute }: Props): JSX.Element {
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = content.length;
  const nearLimit = charCount > MAX_CHARS * 0.8;
  const atLimit = charCount >= MAX_CHARS;

  const reset = (): void => {
    setContent("");
    setDone(false);
    setError(null);
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!content.trim() || atLimit) return;
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
      onContribute();
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Couldn't submit — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const totalCount = contributionCount;
    return (
      <div className="contribute-thankyou">
        <div className="confetti-wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="confetti-particle" />
          ))}
          <div className="confetti-icon">
            <Icon name="sparkles" size={52} />
          </div>
        </div>

        {totalCount > 0 && (
          <div className="thankyou-impact">
            <Icon name="flame" size={14} />
            {totalCount === 1
              ? "Your 1st contribution — thank you!"
              : `${totalCount} contributions — you're a champion!`}
          </div>
        )}

        <h2 className="uc-title">Thank you 🙌</h2>
        <p className="uc-body">
          An admin will review your submission. UniClaw gets smarter thanks to students like you.
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

        {/* ── CATEGORY PICKER ── */}
        <div className="uc-field">
          <span className="uc-field-label">Category</span>
          <div className="category-picker">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`cat-chip ${category === c.value ? "selected" : ""}`}
                onClick={() => setCategory(c.value)}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT TEXTAREA ── */}
        <div className="uc-card">
          <div className="uc-field">
            <span className="uc-field-label">What do you want to contribute?</span>
            <div className="textarea-wrap">
              <textarea
                className="uc-textarea"
                placeholder="Be specific — names, times, fees, office locations, URLs…"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                rows={6}
              />
              <div
                className={`char-count ${atLimit ? "at-limit" : nearLimit ? "near-limit" : ""}`}
              >
                {charCount} / {MAX_CHARS}
              </div>
            </div>
          </div>
        </div>

        <div className="contribute-info">
          <Icon name="check" size={15} />
          Submissions are reviewed by an admin before going live.
        </div>
      </section>

      <div className="contribute-submit">
        {error && <p className="uc-error">{error}</p>}
        <button
          type="submit"
          className="uc-button"
          disabled={submitting || !content.trim() || atLimit}
        >
          {submitting ? "Submitting…" : "Submit contribution"}
        </button>
      </div>
    </form>
  );
}
