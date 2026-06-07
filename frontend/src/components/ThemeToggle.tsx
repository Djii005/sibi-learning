import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/state/theme";

/**
 * Left/right sliding pill switch. Sun anchors the light end (knob far left),
 * moon anchors the dark end (knob far right). Implemented as a single
 * <button role="switch"> so screen readers announce a toggle, not two buttons.
 */
export function ThemeToggle(): JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark ? "Beralih ke tema terang" : "Beralih ke tema gelap"
      }
      onClick={toggle}
      className={[
        "relative inline-flex items-center w-16 h-9 shrink-0 rounded-full",
        "border-2 border-[var(--color-border-strong)]",
        "bg-[var(--color-bg-subtle)] transition-colors duration-150",
        "focus-visible:outline-none",
      ].join(" ")}
    >
      <span className="sr-only">
        {isDark ? "Tema gelap aktif" : "Tema terang aktif"}
      </span>
      <Sun
        aria-hidden="true"
        size={14}
        className={[
          "absolute left-2 transition-opacity duration-150",
          isDark
            ? "opacity-40 text-[var(--color-fg-muted)]"
            : "opacity-100 text-accent-600",
        ].join(" ")}
      />
      <Moon
        aria-hidden="true"
        size={14}
        className={[
          "absolute right-2 transition-opacity duration-150",
          isDark
            ? "opacity-100 text-[var(--color-accent)]"
            : "opacity-40 text-[var(--color-fg-muted)]",
        ].join(" ")}
      />
      <span
        aria-hidden="true"
        className={[
          "inline-block w-7 h-7 rounded-full bg-white shadow",
          "transition-transform duration-150 ease-out",
          isDark ? "translate-x-7" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
