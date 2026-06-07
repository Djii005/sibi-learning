import { Link } from "react-router-dom";
import {
  Camera,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Card } from "@/components/Card";
import { useAuth } from "@/state/auth";

export function HomePage(): JSX.Element {
  const { user } = useAuth();

  return (
    <div className="space-y-12 animate-fade-up">
      <section
        aria-labelledby="hero-heading"
        className="relative rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-soft overflow-hidden"
      >
        <div className="absolute inset-0 bg-dots opacity-30" aria-hidden="true" />
        <div className="relative grid gap-6 p-8 sm:p-12 sm:grid-cols-[1.4fr,1fr] items-center">
          <div>
            <span className="chip chip-accent mb-4">
              <Sparkles aria-hidden="true" size={14} />
              Gratis &amp; ramah pemula
            </span>
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3"
            >
              Belajar bahasa isyarat Indonesia,{" "}
              <span className="text-brand-600">satu isyarat per hari.</span>
            </h1>
            <p className="text-lg text-[var(--color-fg-muted)] max-w-xl mb-6">
              Latih huruf, angka, dan sapaan dengan kamera Anda. Cepat, ringan,
              dan privasi tetap aman — pemrosesan gambar berjalan di peramban
              Anda sendiri.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Link
                to={user ? "/lessons" : "/register"}
                className="btn-pop btn-pop-primary text-base px-6 py-3"
              >
                {user ? "Lanjutkan belajar" : "Mulai gratis"}
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="btn-pop btn-pop-secondary text-base px-6 py-3 no-underline"
                >
                  Sudah punya akun? Masuk
                </Link>
              )}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative hidden sm:flex items-center justify-center"
          >
            <div className="absolute w-56 h-56 rounded-full bg-accent-100 dark:bg-brand-900/40" />
            <div className="absolute w-40 h-40 rounded-full bg-brand-100 dark:bg-brand-800/40" />
            <div className="relative w-44 h-44 rounded-3xl bg-brand-500 text-white flex items-center justify-center shadow-pop text-7xl font-extrabold">
              👋
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="grid gap-4 sm:grid-cols-3"
      >
        <h2 id="features-heading" className="sr-only">
          Fitur utama
        </h2>
        <Card>
          <div className="w-12 h-12 mb-3 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300">
            <Camera aria-hidden="true" size={22} />
          </div>
          <h3 className="text-xl font-bold mb-1">Kamera lokal</h3>
          <p className="text-[var(--color-fg-muted)]">
            MediaPipe Hands melacak 21 titik tangan langsung di browser. Tidak
            ada gambar yang dikirim ke server.
          </p>
        </Card>
        <Card>
          <div className="w-12 h-12 mb-3 rounded-2xl bg-accent-100 dark:bg-accent-700/40 flex items-center justify-center text-accent-700 dark:text-accent-300">
            <GraduationCap aria-hidden="true" size={22} />
          </div>
          <h3 className="text-xl font-bold mb-1">Tiga modul</h3>
          <p className="text-[var(--color-fg-muted)]">
            Alfabet A–Z, angka 0–9, dan sapaan dinamis dengan model LSTM
            ringan.
          </p>
        </Card>
        <Card>
          <div className="w-12 h-12 mb-3 rounded-2xl bg-coral-100 dark:bg-coral-700/40 flex items-center justify-center text-coral-600 dark:text-coral-300">
            <ShieldCheck aria-hidden="true" size={22} />
          </div>
          <h3 className="text-xl font-bold mb-1">Privasi terjaga</h3>
          <p className="text-[var(--color-fg-muted)]">
            Pemrosesan gambar berjalan di peramban Anda. Hanya skor latihan
            (angka) yang disimpan untuk melacak kemajuan.
          </p>
        </Card>
      </section>

      <section aria-labelledby="how-heading" className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="w-10 h-10 rounded-2xl bg-accent-400 text-[var(--color-fg)] flex items-center justify-center shadow-pop"
          >
            <Trophy size={18} />
          </span>
          <h2 id="how-heading" className="text-2xl font-extrabold">
            Bagaimana cara kerjanya?
          </h2>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {[
            {
              n: 1,
              title: "Buat akun gratis",
              body: "Email dan kata sandi cukup. Akun membuka semua materi pelajaran dan menyimpan kemajuan Anda.",
            },
            {
              n: 2,
              title: "Pilih modul",
              body: "Mulai dari alfabet, lanjut ke angka, lalu sapaan dinamis. Setiap kartu punya foto + instruksi tertulis.",
            },
            {
              n: 3,
              title: "Latih di depan kamera",
              body: "Izinkan kamera; MediaPipe akan mendeteksi tangan Anda dan menampilkan skor kemiripan secara langsung.",
            },
            {
              n: 4,
              title: "Kumpulkan kemajuan",
              body: "Skor terbaik dan jumlah upaya tersimpan ke profil. Ringkasan menunjukkan isyarat yang sudah Anda kuasai.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="flex gap-4 p-5 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-soft"
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-extrabold shadow-pop"
              >
                {step.n}
              </span>
              <div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
