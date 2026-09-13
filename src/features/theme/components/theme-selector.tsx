"use client";

import { useTheme } from "../theme-provider";
import type { ThemePreference } from "../theme.types";

const options: Array<{ value: ThemePreference; label: string; icon: string }> =
  [
    { value: "system", label: "System", icon: "fa-laptop" },
    { value: "light", label: "Light", icon: "fa-sun" },
    { value: "dark", label: "Dark", icon: "fa-moon" },
  ];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="grid grid-cols-3 gap-2 p-2" aria-label="Color theme">
      <legend className="sr-only">Color theme</legend>
      {options.map((option) => {
        const selected = theme === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => setTheme(option.value)}
            aria-pressed={selected}
            className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
              selected
                ? "bg-surface-tertiary text-foreground dark:bg-surface-dark-tertiary dark:text-foreground-dark"
                : "text-foreground-secondary hover:bg-surface-secondary dark:text-foreground-dark-secondary dark:hover:bg-surface-dark-secondary"
            }`}
          >
            <i
              className={`fa-regular ${option.icon} text-base`}
              aria-hidden="true"
            />
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
