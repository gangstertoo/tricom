import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listEmails, syncEmails, EmailDTO, aiSuggest, scheduleSuggest, createCalendarEvent } from "@/lib/api";
import { CalendarClock, MailOpen, RefreshCw, Search, Send, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function Index() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<string>("all");
  const { data: emails = [], isLoading, isFetching } = useQuery({
    queryKey: ["emails", { q, priority }],
    queryFn: () => listEmails({ q, priority: priority === "all" ? undefined : priority }),
    refetchInterval: 30000,
  });
  const [selected, setSelected] = useState<EmailDTO | null>(null);

  const sync = useMutation({
    mutationFn: () => syncEmails(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emails"] }),
  });

  const onOpen = (e: EmailDTO) => setSelected(e);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorBoundary>
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Inbox</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending}>
                    <RefreshCw className={"h-4 w-4" + (sync.isPending ? " animate-spin" : "")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                  <Select value={priority || undefined} onValueChange={setPriority}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="divide-y rounded-md border">
                  {isLoading || isFetching ? (
                    <div className="p-6 text-center text-muted-foreground">Loading…</div>
                  ) : emails.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">No emails found</div>
                  ) : (
                    emails.map((e) => (
                      <button key={e._id} className="w-full text-left p-3 hover:bg-muted/50 focus:bg-muted/50" onClick={() => onOpen(e)}>
                        <div className="flex items-center gap-2">
                          <Badge variant={e.priority === "urgent" ? "destructive" : e.priority === "neutral" ? "secondary" : "outline"}>
                            {e.priority}
                          </Badge>
                          <div className="truncate font-medium">{e.subject || "(no subject)"}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <MailOpen className="h-3 w-3" /> {e.from}
                          <span>•</span>
                          {format(new Date(e.date), "PP p")}
                        </div>
                        <div className="text-sm line-clamp-2 mt-1 text-muted-foreground">{e.snippet}</div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!selected ? (
              <Card className="h-full">
                <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                  Select an email to see details and AI suggestions.
                </CardContent>
              </Card>
            ) : (
              <EmailDetail email={selected} onRefresh={() => qc.invalidateQueries({ queryKey: ["emails"] })} />)
            }
          </div>
        </ErrorBoundary>
      </div>
    </AppShell>
  );
}

function EmailDetail({ email, onRefresh }: { email: EmailDTO; onRefresh: () => void }) {
  const [tab, setTab] = useState("content");
  const suggest = useMutation({ mutationFn: () => aiSuggest(email._id) });
  const [attendees, setAttendees] = useState<string>("");
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const slotsQuery = useMutation({ mutationFn: () => scheduleSuggest({ attendees: attendees.split(",").map((s) => s.trim()).filter(Boolean), durationMins: duration, timezone }) });
  const createEventMut = useMutation({ mutationFn: () => createCalendarEvent({ title: email.subject || "Meeting", attendees: attendees.split(",").map((s) => s.trim()).filter(Boolean), startISO: selectedSlot!.start, endISO: selectedSlot!.end, description: email.snippet }) });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">{email.subject || "(no subject)"}</span>
          <Badge variant={email.priority === "urgent" ? "destructive" : email.priority === "neutral" ? "secondary" : "outline"}>{email.priority}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
            <TabsTrigger value="schedule">Smart Scheduling</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">From: {email.from}</div>
            <div className="text-sm text-muted-foreground">To: {email.to.join(", ")}</div>
            <div className="prose prose-sm max-w-none mt-3" dangerouslySetInnerHTML={{ __html: email.bodyHtml || `<pre class=\"whitespace-pre-wrap\">${email.bodyText || email.snippet}</pre>` }} />
          </TabsContent>
          <TabsContent value="ai" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => suggest.mutate()} disabled={suggest.isPending}>
                <Sparkles className="h-4 w-4 mr-2" /> Generate suggestions
              </Button>
            </div>
            <div className="grid gap-3">
              {(suggest.data?.suggestions || email.aiSuggestions || []).map((s, i) => (
                <div key={i} className="rounded-md border p-3 text-sm bg-muted/30 whitespace-pre-wrap">{s}</div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="schedule" className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Attendees</Label>
                <Input placeholder="email1@example.com, email2@example.com" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
              </div>
              <div>
                <Label>Duration (mins)</Label>
                <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => slotsQuery.mutate()} disabled={slotsQuery.isPending}>
                <CalendarClock className="h-4 w-4 mr-2" /> Suggest times
              </Button>
            </div>
            {slotsQuery.data && (
              <div className="text-xs text-muted-foreground">Timezone: {slotsQuery.data.timezone}</div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slotsQuery.data?.slots.map((s) => (
                <button key={s.start} onClick={() => setSelectedSlot(s)} className={"rounded-md border p-3 text-left text-sm hover:bg-muted " + (selectedSlot?.start === s.start ? "ring-2 ring-primary" : "") }>
                  {format(new Date(s.start), "PP p")} – {format(new Date(s.end), "p")}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => createEventMut.mutate()} disabled={!selectedSlot || createEventMut.isPending}>
                <Send className="h-4 w-4 mr-2" /> Create Calendar Event
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
