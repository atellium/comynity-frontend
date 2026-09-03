"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DARK_MODE_QUERY,
  THEME_STORAGE_KEY,
} from "./theme.constants";
import type { ResolvedTheme, ThemePreference } from "./theme.types";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme: ThemePreference) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.add("theme-changing");
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("theme-changing");
    });
  });
  return resolvedTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("light");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = isThemePreference(storedTheme) ? storedTheme : "light";
    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      setThemeState(initialTheme);
      setResolvedTheme(applyTheme(initialTheme));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const updateSystemTheme = () => setResolvedTheme(applyTheme("system"));
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(applyTheme(nextTheme));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
