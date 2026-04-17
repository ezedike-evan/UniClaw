import { IconButton } from "@telegram-apps/telegram-ui";
import type { Theme } from "../types";
import { Icon } from "./icons";

interface Props {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props): JSX.Element {
  return (
    <IconButton
      mode="bezeled"
      size="s"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
    </IconButton>
  );
}
