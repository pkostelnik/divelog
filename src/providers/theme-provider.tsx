"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("divelog-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setThemeState(getPreferredTheme());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const nextTheme = theme ?? "light";
    root.classList.toggle("dark", nextTheme === "dark");
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    if (hasHydrated) {
      window.localStorage.setItem("divelog-theme", nextTheme);
    }
  }, [theme, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return;

    const listener = (event: MediaQueryListEvent) => {
      setThemeState(() => {
        const stored = window.localStorage.getItem("divelog-theme");
        if (stored === "light" || stored === "dark") {
          return stored;
        }
        return event.matches ? "dark" : "light";
      });
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [hasHydrated]);

  const value = useMemo<ThemeContextValue>(() => {
    const setTheme = (next: Theme) => setThemeState(next);
    const toggleTheme = () => setThemeState((previous) => (previous === "dark" ? "light" : "dark"));
    return {
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
