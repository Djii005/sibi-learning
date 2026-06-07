import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sibi.theme";

function readInitial(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (theme: Theme) => void;
  init: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "light",
  toggle() {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    apply(next);
    set({ theme: next });
  },
  set(theme) {
    apply(theme);
    set({ theme });
  },
  init() {
    const initial = readInitial();
    apply(initial);
    set({ theme: initial });
  },
}));
