import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hand, Lock, Sparkles, Star } from "lucide-react";

import { Card } from "@/components/Card";
import { apiRequest } from "@/lib/api";
import type { Lesson, ProgressSummary } from "@/lib/types";
import { useAuth } from "@/state/auth";

export function LessonsPage(): JSX.Element {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lessonList, summaryRes] = await Promise.all([
          apiRequest<Lesson[]>("/api/lessons", { auth: false }),
          apiRequest<ProgressSummary>("/api/progress/summary").catch(() => null),
        ]);
        if (!cancelled) {
          setLessons(lessonList);
          setSummary(summaryRes);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat pelajaran.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <header>
        <h1 className="text-3xl font-extrabold mb-2">Pelajaran SIBI</h1>
        <p className="text-[var(--color-fg-muted)] max-w-2xl">
          Pilih modul untuk mulai belajar. Setiap modul berisi kartu referensi
          dan halaman latihan kamera dengan umpan balik langsung.
        </p>
      </header>

      {!user && (
        <Card className="bg-accent-50 dark:bg-accent-700/20 border-accent-300 dark:border-accent-600">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="shrink-0 w-10 h-10 rounded-2xl bg-accent-400 text-[var(--color-fg)] flex items-center justify-center shadow-pop"
            >
              <Sparkles size={18} />
            </span>
            <div className="flex-1">
              <h2 className="font-bold mb-1">Daftar gratis untuk membuka materi</h2>
              <p className="text-sm text-[var(--color-fg-muted)] mb-3">
                Setiap pelajaran (materi dan latihan kamera) terbuka begitu Anda
                memiliki akun. Kami menyimpan kemajuan supaya Anda bisa
                lanjutkan kapan saja.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link to="/register" className="btn-pop btn-pop-primary text-sm">
                  Buat akun gratis
                </Link>
                <Link
                  to="/login"
                  className="btn-pop btn-pop-secondary text-sm no-underline"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {summary && (
        <Card ariaLabelledBy="progress-heading">
          <div className="flex items-center gap-3 mb-3">
            <span
              aria-hidden="true"
              className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-pop"
            >
              <Star size={18} />
            </span>
            <h2 id="progress-heading" className="text-xl font-bold">
              Kemajuan Anda
            </h2>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-fg-muted)]">Isyarat dikuasai</dt>
              <dd className="text-2xl font-extrabold">
                {summary.mastered_signs}{" "}
                <span className="text-base font-medium">
                  / {summary.total_signs}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Total upaya</dt>
              <dd className="text-2xl font-extrabold">{summary.attempts}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Rata-rata skor</dt>
              <dd className="text-2xl font-extrabold">
                {(summary.average_score * 100).toFixed(0)}%
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-fg-muted)]">Isyarat dicoba</dt>
              <dd className="text-2xl font-extrabold">{summary.items.length}</dd>
            </div>
          </dl>
        </Card>
      )}

      {error && (
        <p role="alert" className="text-coral-700 dark:text-coral-300">
          {error}
        </p>
      )}

      {!lessons && !error && (
        <p role="status" aria-live="polite">
          Memuat pelajaran…
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {(lessons ?? []).map((lesson) => (
          <li key={lesson.id}>
            <Card as="article" ariaLabelledBy={`lesson-${lesson.slug}`}>
              <div className="flex items-start gap-3 mb-3">
                <span
                  aria-hidden="true"
                  className={[
                    "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-pop",
                    lesson.is_dynamic
                      ? "bg-accent-400 text-[var(--color-fg)]"
                      : "bg-brand-500 text-white",
                  ].join(" ")}
                >
                  <Hand size={22} />
                </span>
                <div className="flex-1">
                  <h2
                    id={`lesson-${lesson.slug}`}
                    className="text-xl font-bold mb-1"
                  >
                    {lesson.title}
                  </h2>
                  <span
                    className={[
                      "chip",
                      lesson.is_dynamic ? "chip-accent" : "chip-brand",
                    ].join(" ")}
                  >
                    {lesson.is_dynamic ? "Dinamis (LSTM)" : "Statis (CNN)"}
                  </span>
                </div>
              </div>
              <p className="text-[var(--color-fg-muted)] mb-4">
                {lesson.description}
              </p>
              {user ? (
                <div className="flex gap-2 flex-wrap">
                  <Link
                    to={`/lessons/${lesson.slug}`}
                    className="btn-pop btn-pop-secondary text-sm no-underline"
                  >
                    Lihat materi
                  </Link>
                  <Link
                    to={`/practice/${lesson.slug}`}
                    className="btn-pop btn-pop-primary text-sm no-underline"
                  >
                    Mulai latihan
                  </Link>
                </div>
              ) : (
                <Link
                  to="/register"
                  state={{ from: { pathname: `/lessons/${lesson.slug}` } }}
                  className="btn-pop btn-pop-primary text-sm no-underline"
                  aria-label={`Daftar untuk membuka ${lesson.title}`}
                >
                  <Lock aria-hidden="true" size={16} />
                  Daftar untuk membuka
                </Link>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
