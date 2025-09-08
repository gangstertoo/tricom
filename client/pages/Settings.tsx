import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { startGoogleAuth, getMe, useAuthStore } from "@/lib/api";

export default function SettingsPage() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const me = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: !!token });

  const connectGoogle = useMutation({
    mutationFn: async () => {
      const url = await startGoogleAuth();
      window.location.href = url;
    },
  });

  return (
    <AppShell>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!token ? (
              <div className="text-muted-foreground">Please log in to manage your settings.</div>
            ) : me.isLoading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : me.isError ? (
              <div className="text-destructive">Failed to load account.</div>
            ) : (
              <div className="space-y-2">
                <div>
                  <Label>Email</Label>
                  <div>{me.data.user.email}</div>
                </div>
                <div>
                  <Label>Name</Label>
                  <div>{me.data.user.name}</div>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <div>{me.data.user.timezone}</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => connectGoogle.mutate()}
                    disabled={connectGoogle.isPending || me.data.user.googleConnected}
                  >
                    {me.data.user.googleConnected ? "Google Connected" : "Connect Google"}
                  </Button>
                  <Button variant="outline" onClick={() => setToken(null)}>
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Connect Google to enable Gmail and Calendar features.
            </div>
            <Button
              onClick={() => connectGoogle.mutate()}
              disabled={connectGoogle.isPending || me.data?.user.googleConnected}
            >
              {me.data?.user.googleConnected ? "Google Connected" : "Connect Google"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
