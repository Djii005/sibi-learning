import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card } from "@/components/Card";
import { useAuth } from "@/state/auth";

export function RegisterPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await register(email, name, password);
      navigate("/lessons", { replace: true });
    } catch {
      /* surfaced in state */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto animate-fade-up">
      <Card ariaLabelledBy="register-heading">
        <div className="flex items-center gap-3 mb-2">
          <span aria-hidden="true" className="text-4xl">
            ✨
          </span>
          <h1 id="register-heading" className="text-2xl font-extrabold">
            Mulai gratis
          </h1>
        </div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Buat akun untuk membuka semua pelajaran dan menyimpan kemajuan Anda.
        </p>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="reg-email" className="block text-sm font-bold mb-1">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
              aria-describedby={error ? "reg-error" : undefined}
            />
          </div>

          <div>
            <label htmlFor="reg-name" className="block text-sm font-bold mb-1">
              Nama tampilan
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="nickname"
              required
              minLength={1}
              maxLength={80}
              value={name}
              onChange={(e) => {
                clearError();
                setName(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-bold mb-1"
            >
              Kata sandi <span className="font-normal text-[var(--color-fg-muted)]">(min. 8 karakter)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
              aria-describedby="reg-password-help"
            />
            <p id="reg-password-help" className="text-xs text-[var(--color-fg-muted)] mt-1">
              Gunakan kombinasi huruf, angka, dan simbol untuk keamanan terbaik.
            </p>
          </div>

          {error && (
            <p
              id="reg-error"
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
            {submitting ? "Memproses…" : "Daftar gratis"}
          </button>
        </form>

        <p className="text-sm text-[var(--color-fg-muted)] mt-4 text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold">
            Masuk
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
