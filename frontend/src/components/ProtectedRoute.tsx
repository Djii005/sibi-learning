import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/state/auth";

interface Props {
  children: JSX.Element;
}

export function ProtectedRoute({ children }: Props): JSX.Element {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status !== "ready") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center min-h-[40vh]"
      >
        <span>Memuat…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
