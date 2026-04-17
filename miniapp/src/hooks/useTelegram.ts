import { useEffect, useMemo, useState } from "react";
import type { TelegramWebApp, TelegramUser, Theme } from "../types";

export interface UseTelegram {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
}

function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem("uniclaw-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.colorScheme;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTelegram(): UseTelegram {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  const webApp = useMemo(() => window.Telegram?.WebApp ?? null, []);
  const user = webApp?.initDataUnsafe.user ?? null;

  useEffect(() => {
    if (!webApp) {
      setReady(true);
      return;
    }
    webApp.ready();
    webApp.expand();
    setReady(true);

    const onTheme = (): void => {
      const stored = localStorage.getItem("uniclaw-theme");
      if (!stored) setThemeState(webApp.colorScheme);
    };
    webApp.onEvent("themeChanged", onTheme);
    return () => webApp.offEvent("themeChanged", onTheme);
  }, [webApp]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = (t: Theme): void => {
    localStorage.setItem("uniclaw-theme", t);
    setThemeState(t);
  };

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { webApp, user, theme, setTheme, toggleTheme, ready };
}
