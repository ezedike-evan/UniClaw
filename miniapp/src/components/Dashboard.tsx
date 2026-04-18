import type { TelegramUser } from "../types";
import { QuickActions, type QuickAction } from "./QuickActions";
import { Icon } from "./icons";

interface Props {
  user: TelegramUser | null;
  faculty: string | null;
  streak: number;
  onAction: (action: QuickAction) => void;
}

const HIGHLIGHTS: Array<{ title: string; when: string; tag: string }> = [
  {
    title: "Matriculation Ceremony",
    when: "Check Student Affairs portal for date",
    tag: "event",
  },
  {
    title: "Semester Exam Timetable",
    when: "Published on Student Portal",
    tag: "exams",
  },
  {
    title: "SUG Cultural Week",
    when: "Watch SUG announcements",
    tag: "event",
  },
];

const CAMPUS_FACTS = [
  "UNILAG was founded in 1962 on a 760-acre campus in Yaba, Lagos.",
  "The UNILAG library holds over 200,000 volumes across all disciplines.",
  "There are 12 faculties and over 50 departments at UNILAG.",
  "UNILAG's first Vice-Chancellor was Prof. Saburi Biobaku in 1962.",
  "The UNILAG campus sits on the Lagos Lagoon waterfront.",
  "UNILAG has produced over 200,000 graduates since its founding.",
  "The Student Union Government (SUG) is one of Nigeria's most active.",
  "UNILAG hosts the largest law faculty in West Africa.",
];

const ALSO_ASK = [
  "What are the hostel allocation dates?",
  "How do I check my exam results?",
  "Where is the SUG office located?",
  "How do I get a student ID card?",
  "Where can I print documents on campus?",
  "What time does the library close?",
  "How do I join a faculty club?",
  "How do I get an attestation letter?",
  "What's the school fees deadline?",
  "How do I defer a semester?",
];

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard({ user, faculty, streak, onAction }: Props): JSX.Element {
  const name = user?.first_name ?? "there";
  const greeting = getTimeGreeting();

  const seed = new Date().getDay();
  const todayFact = CAMPUS_FACTS[seed % CAMPUS_FACTS.length];
  const todayQuestions = [0, 1, 2].map((i) => ALSO_ASK[(seed + i) % ALSO_ASK.length]);

  return (
    <div className="dashboard">
      {/* ── HERO ── */}
      <div className="dashboard-hero">
        <div className="hero-eyebrow">UniClaw · UNILAG{faculty ? ` · ${faculty}` : ""}</div>
        <h1 className="hero-title">
          {greeting},{" "}
          <span style={{ display: "inline" }}>{name} 👋</span>
        </h1>
        <p className="hero-subtitle">
          Ask me anything about campus — I only answer from verified information.
        </p>

        {streak > 1 && (
          <div className="hero-streak">
            <Icon name="flame" size={14} />
            {streak}-day streak
          </div>
        )}

        <div className="stat-bar">
          <div className="stat-item">
            <span className="stat-value">1,200+</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">8</span>
            <span className="stat-label">Topics</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">UNILAG</span>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        {/* ── ASK BAR ── */}
        <button
          type="button"
          className="uc-ask-bar"
          onClick={() =>
            onAction({
              id: "freeform",
              icon: "chat",
              title: "Ask anything",
              subtitle: "",
              prompt: "",
              freeform: true,
            })
          }
        >
          <Icon name="sparkles" size={18} />
          Ask UniClaw anything…
        </button>

        {/* ── QUICK ACTIONS ── */}
        <QuickActions onPick={onAction} />

        {/* ── STUDENTS ALSO ASK ── */}
        <section className="uc-section">
          <h2 className="uc-section-header">Students also ask</h2>
          <div className="also-ask-row">
            {todayQuestions.map((q) => (
              <button
                key={q}
                type="button"
                className="also-ask-chip"
                onClick={() =>
                  onAction({
                    id: "also-ask",
                    icon: "chat",
                    title: q,
                    subtitle: "",
                    prompt: q,
                  })
                }
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* ── WHAT'S HAPPENING ── */}
        <section className="uc-section">
          <h2 className="uc-section-header">What's happening</h2>
          <div className="uc-card">
            {HIGHLIGHTS.map((h) => (
              <button
                key={h.title}
                type="button"
                className="event-card"
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
                <div className="event-accent" />
                <div className="event-body">
                  <span className="event-title">{h.title}</span>
                  <span className="event-when">{h.when}</span>
                </div>
                <span className="event-tag">{h.tag}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── DID YOU KNOW ── */}
        <div className="dyk-card">
          <div className="dyk-icon">
            <Icon name="lightbulb" size={18} />
          </div>
          <div className="dyk-inner">
            <div className="dyk-label">Did you know?</div>
            <div className="dyk-text">{todayFact}</div>
          </div>
        </div>

        <p className="dashboard-footnote">Powered by Claude · Grounded by UNILAG knowledge base</p>
      </div>
    </div>
  );
}
