import type { TelegramUser } from "../types";
import { QuickActions, type QuickAction } from "./QuickActions";
import { Icon } from "./icons";

interface Props {
  user: TelegramUser | null;
  onAction: (action: QuickAction) => void;
}

const HIGHLIGHTS: Array<{ title: string; when: string; tag: string }> = [
  {
    title: "Matriculation Ceremony",
    when: "Check Student Affairs portal for date",
    tag: "event",
  },
  {
    title: "Semester exam timetable",
    when: "Published on Student Portal",
    tag: "exams",
  },
  {
    title: "SUG Cultural Week",
    when: "Watch SUG announcements",
    tag: "event",
  },
];

export function Dashboard({ user, onAction }: Props): JSX.Element {
  const name = user?.first_name ?? "there";

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-eyebrow">UniClaw · UNILAG</div>
        <h1 className="dashboard-title">Hey {name}</h1>
        <p className="dashboard-subtitle">
          Ask me anything about campus. I only answer from verified info.
        </p>
      </header>

      <div className="dashboard-body">
        <QuickActions onPick={onAction} />

        <section className="uc-section">
          <h2 className="uc-section-header">What's happening</h2>
          <div className="uc-card">
            {HIGHLIGHTS.map((h, i) => (
              <button
                key={h.title}
                type="button"
                className="uc-cell"
                data-first={i === 0 ? "true" : undefined}
                data-last={i === HIGHLIGHTS.length - 1 ? "true" : undefined}
                onClick={() =>
                  onAction({
                    id: h.tag,
                    icon: "events",
                    title: h.title,
                    subtitle: h.when,
                    prompt: `Tell me about "${h.title}" at UNILAG.`,
                  })
                }
              >
                <span className="uc-cell-icon">
                  <Icon name="events" size={22} />
                </span>
                <span className="uc-cell-body">
                  <span className="uc-cell-title">{h.title}</span>
                  <span className="uc-cell-subtitle">{h.when}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <p className="dashboard-footnote">
          Powered by Claude · Grounded by UNILAG knowledge base
        </p>
      </div>
    </div>
  );
}
