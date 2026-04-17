import { Cell, Section } from "@telegram-apps/telegram-ui";
import { Icon, type IconKey } from "./icons";

export interface QuickAction {
  id: string;
  icon: IconKey;
  title: string;
  subtitle: string;
  prompt: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "hostel",
    icon: "hostel",
    title: "Hostels",
    subtitle: "Options, fees, how to apply",
    prompt: "Tell me about UNILAG hostels — options, fees, how to apply.",
  },
  {
    id: "timetable",
    icon: "timetable",
    title: "Timetable",
    subtitle: "Class schedules & where to find yours",
    prompt: "How does the UNILAG timetable work and where do I find mine?",
  },
  {
    id: "events",
    icon: "events",
    title: "Events",
    subtitle: "What's happening on campus",
    prompt: "What's happening on UNILAG campus right now?",
  },
  {
    id: "exams",
    icon: "exams",
    title: "Exams",
    subtitle: "Timetable & results portal",
    prompt: "Tell me about exam schedules and the results portal.",
  },
  {
    id: "food",
    icon: "food",
    title: "Food",
    subtitle: "Spots around campus",
    prompt: "Where are the best food spots around UNILAG?",
  },
  {
    id: "contacts",
    icon: "contacts",
    title: "Contacts",
    subtitle: "Offices, faculty, emergencies",
    prompt: "Give me the key UNILAG offices and contacts a student needs.",
  },
];

interface Props {
  onPick: (action: QuickAction) => void;
}

export function QuickActions({ onPick }: Props): JSX.Element {
  return (
    <Section header="Quick actions">
      {QUICK_ACTIONS.map((a) => (
        <Cell
          key={a.id}
          before={<Icon name={a.icon} />}
          subtitle={a.subtitle}
          onClick={() => onPick(a)}
        >
          {a.title}
        </Cell>
      ))}
    </Section>
  );
}
