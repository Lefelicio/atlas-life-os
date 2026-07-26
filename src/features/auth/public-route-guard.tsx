import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/auth-context";
import { FullScreenLoader } from "@/components/full-screen-loader";

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, user, navigate]);

  return { loading, user };
}

export function PublicRouteGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useRedirectIfAuthenticated();
  if (loading) return <FullScreenLoader />;
  if (user) return null;
  return <>{children}</>;
}
