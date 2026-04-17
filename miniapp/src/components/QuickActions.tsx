export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  prompt: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "hostel",
    icon: "🏠",
    title: "Hostels",
    prompt: "Tell me about UNILAG hostels — options, fees, how to apply.",
  },
  {
    id: "timetable",
    icon: "📅",
    title: "Timetable",
    prompt: "How does the UNILAG timetable work and where do I find mine?",
  },
  {
    id: "events",
    icon: "🎉",
    title: "Events",
    prompt: "What's happening on UNILAG campus right now?",
  },
  {
    id: "exams",
    icon: "📝",
    title: "Exams",
    prompt: "Tell me about exam schedules and the results portal.",
  },
  {
    id: "food",
    icon: "🍱",
    title: "Food",
    prompt: "Where are the best food spots around UNILAG?",
  },
  {
    id: "contacts",
    icon: "📞",
    title: "Contacts",
    prompt: "Give me the key UNILAG offices and contacts a student needs.",
  },
];

interface Props {
  onPick: (action: QuickAction) => void;
}

export function QuickActions({ onPick }: Props): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUICK_ACTIONS.map((a, i) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onPick(a)}
          className="glass-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] animate-fade-in-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="text-2xl mb-2">{a.icon}</div>
          <div className="font-semibold">{a.title}</div>
          <div className="text-xs muted mt-0.5 line-clamp-2">{a.prompt}</div>
        </button>
      ))}
    </div>
  );
}
