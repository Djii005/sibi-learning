import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Hand, LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/state/auth";

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: "/", label: "Beranda" },
  { to: "/lessons", label: "Pelajaran" },
  { to: "/practice/alphabet", label: "Latihan Kamera" },
];

export function Layout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Lompat ke konten utama
      </a>

      <header
        className="bg-[var(--color-bg-elevated)] border-b-2 border-[var(--color-border)]"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-lg no-underline text-[var(--color-fg)]"
            aria-label="SIBI Belajar - kembali ke beranda"
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-500 text-white shadow-pop"
            >
              <Hand size={20} />
            </span>
            <span>SIBI Belajar</span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex-1 flex flex-wrap gap-1 sm:gap-2 text-sm"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "px-4 py-2 rounded-full no-underline font-bold transition-colors",
                    isActive
                      ? "bg-brand-500 text-white shadow-pop"
                      : "text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)]",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm">
                  Halo, <strong>{user.display_name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="btn-pop btn-pop-secondary text-sm"
                >
                  <LogOut aria-hidden="true" size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-full no-underline text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] font-bold text-sm"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="btn-pop btn-pop-primary text-sm no-underline"
                >
                  Daftar gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-6xl w-full mx-auto px-4 py-8"
      >
        <Outlet />
      </main>

      <footer
        role="contentinfo"
        className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-between">
          <p className="text-[var(--color-fg-muted)]">
            © {new Date().getFullYear()} SIBI Belajar.
          </p>
          <p className="text-[var(--color-fg-muted)]">
            Dataset:{" "}
            <a
              href="https://www.kaggle.com/datasets/mlanangafkaar/datasets-lemlitbang-sibi-alphabets"
              target="_blank"
              rel="noreferrer"
            >
              SIBI Alphabets (Kaggle)
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
