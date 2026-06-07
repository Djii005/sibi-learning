import { create } from "zustand";

import { apiRequest, getToken, setToken } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  async bootstrap() {
    const token = getToken();
    if (!token) {
      set({ status: "ready" });
      return;
    }
    set({ status: "loading" });
    try {
      const me = await apiRequest<User>("/api/auth/me");
      set({ user: me, status: "ready", error: null });
    } catch {
      setToken(null);
      set({ user: null, status: "ready" });
    }
  },

  async login(email, password) {
    set({ status: "loading", error: null });
    try {
      const res = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(res.access_token);
      set({ user: res.user, status: "ready", error: null });
    } catch (err) {
      set({
        status: "ready",
        error: err instanceof Error ? err.message : "Login gagal. Coba lagi.",
      });
      throw err;
    }
  },

  async register(email, displayName, password) {
    set({ status: "loading", error: null });
    try {
      const res = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: { email, display_name: displayName, password },
        auth: false,
      });
      setToken(res.access_token);
      set({ user: res.user, status: "ready", error: null });
    } catch (err) {
      set({
        status: "ready",
        error: err instanceof Error ? err.message : "Pendaftaran gagal. Coba lagi.",
      });
      throw err;
    }
  },

  logout() {
    setToken(null);
    set({ user: null, error: null });
  },

  clearError() {
    set({ error: null });
  },
}));
