import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, syncEmails } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const qc = useQueryClient();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      (async () => {
        try {
          await syncEmails();
          await qc.invalidateQueries({ queryKey: ["emails"] });
        } catch {}
        navigate("/", { replace: true });
      })();
    } else {
      navigate("/", { replace: true });
    }
  }, [params, setToken, navigate, qc]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Signing you in…</div>
    </div>
  );
}
