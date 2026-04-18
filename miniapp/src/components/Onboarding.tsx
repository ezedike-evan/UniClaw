import { useState } from "react";
import { Icon } from "./icons";

const FACULTIES = [
  "Arts",
  "Business Admin",
  "Engineering",
  "Law",
  "Medicine",
  "Pharmacy",
  "Science",
  "Social Sciences",
  "Education",
  "Environmental Sci",
];

const DOMAINS = [
  { icon: "hostel" as const, label: "Hostels" },
  { icon: "timetable" as const, label: "Timetables" },
  { icon: "exams" as const, label: "Exams" },
  { icon: "food" as const, label: "Food spots" },
  { icon: "contacts" as const, label: "Contacts" },
  { icon: "events" as const, label: "Events" },
];

interface Props {
  onComplete: (faculty: string) => void;
}

export function Onboarding({ onComplete }: Props): JSX.Element {
  const [step, setStep] = useState(0);
  const [faculty, setFaculty] = useState<string | null>(null);

  const advance = (): void => {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      onComplete(faculty ?? "Other");
    }
  };

  return (
    <div className="ob-overlay">
      <div className="ob-sheet">
        <div className="ob-dots">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`ob-dot ${i === step ? "ob-dot--active" : ""}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="ob-step">
            <div className="ob-logo">
              <Icon name="sparkles" size={40} />
            </div>
            <h1 className="ob-title">Meet UniClaw</h1>
            <p className="ob-body">
              Your AI-powered campus guide for the University of Lagos — verified,
              instant, and always in your pocket.
            </p>
            <div className="ob-feature-row">
              <div className="ob-feature">
                <Icon name="clock" size={18} />
                <span>Instant answers</span>
              </div>
              <div className="ob-feature">
                <Icon name="check" size={18} />
                <span>UNILAG verified</span>
              </div>
              <div className="ob-feature">
                <Icon name="users" size={18} />
                <span>Student-powered</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-title">I know about…</h2>
            <p className="ob-body">
              Ask me anything across these campus topics and I'll give you
              accurate, grounded answers.
            </p>
            <div className="ob-domain-grid">
              {DOMAINS.map((d) => (
                <div key={d.label} className="ob-domain-card">
                  <Icon name={d.icon} size={24} />
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step">
            <h2 className="ob-title">Pick your faculty</h2>
            <p className="ob-body">
              UniClaw will personalize your experience based on your faculty.
              You can change this anytime.
            </p>
            <div className="ob-faculty-grid">
              {FACULTIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`ob-faculty-chip ${faculty === f ? "ob-faculty-chip--selected" : ""}`}
                  onClick={() => setFaculty(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ob-footer">
          <button type="button" className="ob-btn-primary" onClick={advance}>
            {step === 2 ? "Get started" : "Next"}
          </button>
          {step < 2 && (
            <button
              type="button"
              className="ob-btn-skip"
              onClick={() => onComplete("Other")}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
