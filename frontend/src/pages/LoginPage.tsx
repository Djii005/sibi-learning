import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Card } from "@/components/Card";
import { useAuth } from "@/state/auth";

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? "/lessons";

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      /* error already surfaced via state */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto animate-fade-up">
      <Card ariaLabelledBy="login-heading">
        <div className="flex items-center gap-3 mb-4">
          <span
            aria-hidden="true"
            className="text-4xl"
          >
            👋
          </span>
          <h1 id="login-heading" className="text-2xl font-extrabold">
            Selamat datang kembali
          </h1>
        </div>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-bold mb-1">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-bold mb-1">
              Kata sandi
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="text-sm text-coral-700 dark:text-coral-300 bg-coral-50 dark:bg-coral-700/20 border-2 border-coral-200 dark:border-coral-600 rounded-2xl px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-pop btn-pop-primary w-full"
          >
            {submitting ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <p className="text-sm text-[var(--color-fg-muted)] mt-4 text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold">
            Daftar gratis
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
