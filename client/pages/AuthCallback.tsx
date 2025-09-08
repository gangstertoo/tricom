import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/lib/api";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      navigate("/", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [params, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Signing you in…</div>
    </div>
  );
}
