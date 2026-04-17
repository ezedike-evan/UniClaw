import type { TelegramUser } from "../types";
import { QUICK_ACTIONS, QuickActions, type QuickAction } from "./QuickActions";

interface Props {
  user: TelegramUser | null;
  onAction: (action: QuickAction) => void;
}

const HIGHLIGHTS = [
  {
    title: "Matriculation Ceremony",
    when: "Check SA portal for date",
    tag: "event",
  },
  {
    title: "First-semester exam timetable",
    when: "Published on Student Portal",
    tag: "exams",
  },
  {
    title: "SUG Cultural Week",
    when: "Watch for SUG announcements",
    tag: "event",
  },
];

export function Dashboard({ user, onAction }: Props): JSX.Element {
  const name = user?.first_name ?? "there";

  return (
    <div className="p-4 pb-28 space-y-6">
      <header className="flex items-start justify-between pt-2">
        <div>
          <div className="text-xs muted">UniClaw · UNILAG</div>
          <h1 className="text-2xl font-bold mt-0.5">
            Hey {name} <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm muted mt-1">
            Ask me anything about campus. I only answer from verified info.
          </p>
        </div>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider muted mb-2">
          Quick actions
        </h2>
        <QuickActions onPick={onAction} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider muted mb-2">
          What's happening
        </h2>
        <div className="space-y-2">
          {HIGHLIGHTS.map((h, i) => (
            <button
              key={h.title}
              type="button"
              onClick={() =>
                onAction({
                  id: h.tag,
                  icon: "📰",
                  title: h.title,
                  prompt: `Tell me about "${h.title}" at UNILAG.`,
                })
              }
              className="glass-card w-full p-3 text-left flex items-center justify-between animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                <div className="font-medium text-sm">{h.title}</div>
                <div className="text-xs muted mt-0.5">{h.when}</div>
              </div>
              <span className="text-xs chip">{h.tag}</span>
            </button>
          ))}
        </div>
      </section>

      <p className="text-center text-xs muted pt-2">
        {QUICK_ACTIONS.length} domains loaded · Powered by Claude
      </p>
    </div>
  );
}
