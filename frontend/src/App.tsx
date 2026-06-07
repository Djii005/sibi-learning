import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { LessonDetailPage } from "@/pages/LessonDetailPage";
import { LessonsPage } from "@/pages/LessonsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PracticePage } from "@/pages/PracticePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useAuth } from "@/state/auth";
import { useTheme } from "@/state/theme";

export default function App(): JSX.Element {
  const bootstrap = useAuth((s) => s.bootstrap);
  const initTheme = useTheme((s) => s.init);

  useEffect(() => {
    initTheme();
    void bootstrap();
  }, [bootstrap, initTheme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route
          path="lessons/:slug"
          element={
            <ProtectedRoute>
              <LessonDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="practice/:slug"
          element={
            <ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound(): JSX.Element {
  return (
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-[var(--color-fg-muted)]">
        URL yang Anda buka tidak terdaftar. Coba kembali ke beranda.
      </p>
    </div>
  );
}
