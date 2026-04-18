import { Icon, type IconKey } from "./icons";

export interface QuickAction {
  id: string;
  icon: IconKey;
  title: string;
  subtitle: string;
  prompt: string;
  freeform?: boolean;
}

interface QuickActionConfig extends QuickAction {
  chipClass: string;
}

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: "hostel",
    icon: "hostel",
    title: "Hostels",
    subtitle: "Options, fees, apply",
    prompt: "Tell me about UNILAG hostels — options, fees, how to apply.",
    chipClass: "qa-icon-chip--hostel",
  },
  {
    id: "timetable",
    icon: "timetable",
    title: "Timetable",
    subtitle: "Schedules & where to find yours",
    prompt: "How does the UNILAG timetable work and where do I find mine?",
    chipClass: "qa-icon-chip--timetable",
  },
  {
    id: "events",
    icon: "events",
    title: "Events",
    subtitle: "What's on campus",
    prompt: "What's happening on UNILAG campus right now?",
    chipClass: "qa-icon-chip--events",
  },
  {
    id: "exams",
    icon: "exams",
    title: "Exams",
    subtitle: "Timetable & results",
    prompt: "Tell me about exam schedules and the results portal.",
    chipClass: "qa-icon-chip--exams",
  },
  {
    id: "food",
    icon: "food",
    title: "Food",
    subtitle: "Spots around campus",
    prompt: "Where are the best food spots around UNILAG?",
    chipClass: "qa-icon-chip--food",
  },
  {
    id: "contacts",
    icon: "contacts",
    title: "Contacts",
    subtitle: "Offices & emergencies",
    prompt: "Give me the key UNILAG offices and contacts a student needs.",
    chipClass: "qa-icon-chip--contacts",
  },
];

interface Props {
  onPick: (action: QuickAction) => void;
}

export function QuickActions({ onPick }: Props): JSX.Element {
  return (
    <section className="uc-section">
      <h2 className="uc-section-header">Quick actions</h2>
      <div className="qa-grid">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className="qa-card"
            onClick={() => onPick(a)}
            aria-label={a.title}
          >
            <span className={`qa-icon-chip ${a.chipClass}`}>
              <Icon name={a.icon} size={24} />
            </span>
            <span className="qa-label">{a.title}</span>
            <span className="qa-sublabel">{a.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
