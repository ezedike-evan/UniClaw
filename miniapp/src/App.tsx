import { useCallback, useEffect, useState } from "react";
import { AppRoot, Tabbar } from "@telegram-apps/telegram-ui";
import { useTelegram } from "./hooks/useTelegram";
import { useChat } from "./hooks/useChat";
import { useRetention } from "./hooks/useRetention";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { ContributeForm } from "./components/ContributeForm";
import { ThemeToggle } from "./components/ThemeToggle";
import { Onboarding } from "./components/Onboarding";
import { Icon } from "./components/icons";
import type { Screen } from "./types";
import type { QuickAction } from "./components/QuickActions";

/* ── Skeleton loading state ──────────────────────────────────── */
function SkeletonDashboard(): JSX.Element {
  return (
    <div className="skeleton-shell">
      <div className="sk-hero" />
      <div className="sk-body">
        <div className="sk-bar sk-block" style={{ width: "60%", height: 14 }} />
        <div className="sk-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="sk-card sk-block" />
          ))}
        </div>
        <div className="sk-bar sk-block" style={{ width: "45%", height: 14 }} />
        <div className="sk-bar sk-block" style={{ width: "100%", height: 80, borderRadius: 16 }} />
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  const { webApp, user, theme, toggleTheme, ready } = useTelegram();
  const chat = useChat(user);
  const retention = useRetention();
  const [screen, setScreen] = useState<Screen>("home");

  const goto = useCallback(
    (s: Screen) => {
      setScreen(s);
      window.Telegram?.WebApp.HapticFeedback?.selectionChanged();

      /* Dismiss new-content badge when visiting home */
      if (s === "home" && retention.hasNewContent) {
        retention.dismissNewContent();
      }
    },
    [retention],
  );

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
      if (action.freeform) {
        /* Just navigate to Chat with focus, no pre-seeded message */
        goto("chat");
        return;
      }
      goto("chat");
      void chat.send(action.prompt);
    },
    [chat, goto],
  );

  const platform: "ios" | "base" =
    (webApp?.platform as string) === "ios" ? "ios" : "base";

  return (
    <AppRoot appearance={theme} platform={platform}>
      {/* ── ONBOARDING ── */}
      {ready && !retention.onboardingDone && (
        <Onboarding onComplete={retention.completeOnboarding} />
      )}

      {!ready ? (
        <div className="app-shell">
          <SkeletonDashboard />
        </div>
      ) : (
        <div className="app-shell">
          {/* Theme toggle floats over content */}
          <div className="app-theme-toggle">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          {/* Animated screen content — key triggers re-animation on tab switch */}
          <main className="app-main" key={screen}>
            {screen === "home" && (
              <Dashboard
                user={user}
                faculty={retention.faculty}
                streak={retention.streak}
                onAction={pickAction}
              />
            )}
            {screen === "chat" && <Chat chat={chat} />}
            {screen === "contribute" && (
              <ContributeForm
                user={user}
                contributionCount={retention.contributionCount}
                onContribute={retention.incrementContributions}
              />
            )}
          </main>

          <Tabbar className="app-tabbar">
            <Tabbar.Item
              text="Home"
              selected={screen === "home"}
              onClick={() => goto("home")}
            >
              <span className="tab-icon-wrap">
                <Icon name="home" />
                {retention.hasNewContent && screen !== "home" && (
                  <span className="tab-badge" aria-label="New content" />
                )}
              </span>
            </Tabbar.Item>

            <Tabbar.Item
              text="Chat"
              selected={screen === "chat"}
              onClick={() => goto("chat")}
            >
              <Icon name="chat" />
            </Tabbar.Item>

            <Tabbar.Item
              text="Contribute"
              selected={screen === "contribute"}
              onClick={() => goto("contribute")}
            >
              <Icon name="contribute" />
            </Tabbar.Item>
          </Tabbar>
        </div>
      )}
    </AppRoot>
  );
}
