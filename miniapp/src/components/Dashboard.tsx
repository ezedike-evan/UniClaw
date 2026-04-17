import { Cell, List, Section } from "@telegram-apps/telegram-ui";
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

      <List style={{ paddingBottom: 96 }}>
        <QuickActions onPick={onAction} />

        <Section header="What's happening">
          {HIGHLIGHTS.map((h) => (
            <Cell
              key={h.title}
              before={<Icon name="events" />}
              subtitle={h.when}
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
              {h.title}
            </Cell>
          ))}
        </Section>

        <p className="dashboard-footnote">
          Powered by Claude · Grounded by UNILAG knowledge base
        </p>
      </List>
    </div>
  );
}
