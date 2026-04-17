import type { Theme } from "../types";

interface Props {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props): JSX.Element {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={onToggle}
      className="glass-card h-10 w-10 flex items-center justify-center text-lg transition hover:scale-105"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
