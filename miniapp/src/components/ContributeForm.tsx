import { useState, type FormEvent } from "react";
import {
  Button,
  Caption,
  List,
  Placeholder,
  Section,
  Select,
  Textarea,
} from "@telegram-apps/telegram-ui";
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
      <div style={{ paddingTop: 40, paddingBottom: 96 }}>
        <Placeholder
          header="Thank you"
          description="An admin will review your submission. UniClaw gets smarter thanks to students like you."
          action={
            <Button size="m" onClick={reset}>
              Submit another
            </Button>
          }
        >
          <div className="thank-icon">
            <Icon name="sparkles" size={56} />
          </div>
        </Placeholder>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <List style={{ paddingBottom: 96 }}>
        <Section
          header="Contribute"
          footer="Help UniClaw stay accurate. Submissions are reviewed before they go live."
        >
          <Select
            header="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Textarea
            header="What do you want to contribute?"
            placeholder="Be specific — names, times, fees, URLs…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </Section>

        <Section>
          <div style={{ padding: "12px 16px" }}>
            {error && (
              <Caption level="1" style={{ color: "var(--tgui--destructive_text_color)" }}>
                {error}
              </Caption>
            )}
            <Button
              type="submit"
              size="l"
              stretched
              disabled={submitting || !content.trim()}
              loading={submitting}
            >
              Submit contribution
            </Button>
          </div>
        </Section>
      </List>
    </form>
  );
}
