import { useCallback, useEffect, useState } from "react";
import { useTelegram } from "./hooks/useTelegram";
import { useChat } from "./hooks/useChat";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { ContributeForm } from "./components/ContributeForm";
import { ThemeToggle } from "./components/ThemeToggle";
import type { Screen } from "./types";
import type { QuickAction } from "./components/QuickActions";

export default function App(): JSX.Element {
  const { webApp, user, theme, toggleTheme, ready } = useTelegram();
  const chat = useChat(user);
  const [screen, setScreen] = useState<Screen>("home");

  const goto = useCallback((s: Screen) => {
    setScreen(s);
    window.Telegram?.WebApp.HapticFeedback?.selectionChanged();
  }, []);

  useEffect(() => {
    if (!webApp) return;
    const onBack = (): void => goto("home");
    if (screen === "home") {
      webApp.BackButton.hide();
    } else {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    }
    return () => webApp.BackButton.offClick(onBack);
  }, [screen, webApp, goto]);

  const pickAction = useCallback(
    (action: QuickAction) => {
      goto("chat");
      void chat.send(action.prompt);
    },
    [chat, goto],
  );

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-5xl animate-logo-pulse">🦅</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="absolute top-3 right-3 z-10">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <main className="flex-1 overflow-hidden">
        {screen === "home" && <Dashboard user={user} onAction={pickAction} />}
        {screen === "chat" && <Chat chat={chat} />}
        {screen === "contribute" && <ContributeForm user={user} />}
      </main>

      <nav
        className="glass-card fixed bottom-3 left-3 right-3 flex rounded-full overflow-hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        <button
          type="button"
          onClick={() => goto("home")}
          className={`nav-btn ${screen === "home" ? "active" : ""}`}
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => goto("chat")}
          className={`nav-btn ${screen === "chat" ? "active" : ""}`}
        >
          <span className="text-lg">💬</span>
          <span>Chat</span>
        </button>
        <button
          type="button"
          onClick={() => goto("contribute")}
          className={`nav-btn ${screen === "contribute" ? "active" : ""}`}
        >
          <span className="text-lg">➕</span>
          <span>Contribute</span>
        </button>
      </nav>
    </div>
  );
}
