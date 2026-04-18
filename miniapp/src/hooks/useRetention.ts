import { useCallback, useEffect, useState } from "react";

export interface RetentionState {
  onboardingDone: boolean;
  completeOnboarding: (faculty: string) => void;
  faculty: string | null;
  streak: number;
  contributionCount: number;
  incrementContributions: () => void;
  hasNewContent: boolean;
  dismissNewContent: () => void;
}

export function useRetention(): RetentionState {
  const [onboardingDone, setOnboardingDone] = useState<boolean>(
    () => localStorage.getItem("uc_onboarding") === "1",
  );
  const [faculty, setFacultyState] = useState<string | null>(
    () => localStorage.getItem("uc_faculty"),
  );
  const [streak, setStreak] = useState<number>(0);
  const [contributionCount, setContributionCount] = useState<number>(
    () => parseInt(localStorage.getItem("uc_contributions") ?? "0", 10),
  );
  const [hasNewContent, setHasNewContent] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("uc_last_visit");
    const storedStreak = parseInt(localStorage.getItem("uc_streak") ?? "0", 10);

    if (lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86_400_000).toDateString();
      const newStreak = lastVisit === yesterday ? storedStreak + 1 : 1;
      localStorage.setItem("uc_streak", String(newStreak));
      localStorage.setItem("uc_last_visit", today);
      setStreak(newStreak);

      const lastContentView = localStorage.getItem("uc_content_viewed");
      if (lastContentView !== today) {
        setHasNewContent(true);
      }
    } else {
      setStreak(storedStreak);
    }
  }, []);

  const completeOnboarding = useCallback((selectedFaculty: string): void => {
    localStorage.setItem("uc_onboarding", "1");
    localStorage.setItem("uc_faculty", selectedFaculty);
    setOnboardingDone(true);
    setFacultyState(selectedFaculty);
  }, []);

  const incrementContributions = useCallback((): void => {
    setContributionCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("uc_contributions", String(next));
      return next;
    });
  }, []);

  const dismissNewContent = useCallback((): void => {
    localStorage.setItem("uc_content_viewed", new Date().toDateString());
    setHasNewContent(false);
  }, []);

  return {
    onboardingDone,
    completeOnboarding,
    faculty,
    streak,
    contributionCount,
    incrementContributions,
    hasNewContent,
    dismissNewContent,
  };
}
