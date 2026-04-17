import {
  Caption,
  Cell,
  List,
  Section,
  Subheadline,
  Title,
} from "@telegram-apps/telegram-ui";
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
    <List style={{ paddingBottom: 96 }}>
      <Section>
        <div style={{ padding: "20px 20px 8px" }}>
          <Caption level="1" weight="3" style={{ opacity: 0.6 }}>
            UniClaw · UNILAG
          </Caption>
          <Title level="1" weight="1" style={{ marginTop: 4 }}>
            Hey {name}
          </Title>
          <Subheadline level="2" style={{ marginTop: 6, opacity: 0.7 }}>
            Ask me anything about campus. I only answer from verified info.
          </Subheadline>
        </div>
      </Section>

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

      <div style={{ textAlign: "center", padding: "12px 16px 0" }}>
        <Caption level="1" style={{ opacity: 0.5 }}>
          Powered by Claude · Grounded by UNILAG knowledge base
        </Caption>
      </div>
    </List>
  );
}
