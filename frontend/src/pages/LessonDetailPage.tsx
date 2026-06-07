import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "@/components/Card";
import { apiRequest } from "@/lib/api";
import type { LessonDetail } from "@/lib/types";

export function LessonDetailPage(): JSX.Element {
  const { slug = "" } = useParams<{ slug: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setError(null);
    apiRequest<LessonDetail>(`/api/lessons/${slug}`, { auth: false })
      .then((res) => {
        if (!cancelled) setLesson(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat pelajaran.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div role="alert" className="space-y-4">
        <h1 className="text-2xl font-bold">Pelajaran tidak ditemukan</h1>
        <p>{error}</p>
        <Link to="/lessons" className="font-semibold">
          Kembali ke daftar pelajaran
        </Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <p role="status" aria-live="polite">
        Memuat pelajaran…
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <header>
        <span
          className={[
            "chip mb-2",
            lesson.is_dynamic ? "chip-accent" : "chip-brand",
          ].join(" ")}
        >
          Modul {lesson.is_dynamic ? "dinamis (LSTM)" : "statis (CNN)"}
        </span>
        <h1 className="text-3xl font-extrabold mb-2">{lesson.title}</h1>
        <p className="text-[var(--color-fg-muted)] max-w-2xl">
          {lesson.description}
        </p>
        <div className="mt-4">
          <Link
            to={`/practice/${lesson.slug}`}
            className="btn-pop btn-pop-primary no-underline"
          >
            Mulai latihan kamera
          </Link>
        </div>
      </header>

      <section aria-label={`Daftar isyarat untuk ${lesson.title}`}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lesson.signs.map((sign) => (
            <li key={sign.id}>
              <Card as="article" ariaLabelledBy={`sign-${sign.id}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 text-white text-xl font-extrabold shadow-pop"
                  >
                    {sign.label.slice(0, 2)}
                  </span>
                  <h2 id={`sign-${sign.id}`} className="text-lg font-bold">
                    {sign.label}
                  </h2>
                </div>
                <img
                  src={sign.image_url}
                  alt={sign.image_alt}
                  loading="lazy"
                  className="w-full rounded-2xl border-2 border-[var(--color-border)] mb-3"
                />
                <p className="text-sm mb-2">
                  <strong>Cara:</strong> {sign.description}
                </p>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  <strong>Tips:</strong> {sign.instructions}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
