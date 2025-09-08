import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCalendarEvent, scheduleSuggest, listCalendarEvents } from "@/lib/api";

export default function CalendarPage() {
  const [attendees, setAttendees] = useState("");
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [title, setTitle] = useState("Meeting");
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  const slotsQuery = useMutation({
    mutationFn: () =>
      scheduleSuggest({
        attendees: attendees
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        durationMins: duration,
        timezone,
      }),
  });

  const createEventMut = useMutation({
    mutationFn: () =>
      createCalendarEvent({
        title,
        attendees: attendees
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startISO: selectedSlot!.start,
        endISO: selectedSlot!.end,
        timezone,
      }),
    onSuccess: () => {
      toast.success("Calendar event created");
      setSelectedSlot(null);
      eventsQuery.mutate();
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to create event");
    },
  });

  const eventsQuery = useMutation({ mutationFn: () => listCalendarEvents() });

  useEffect(() => {
    eventsQuery.mutate();
  }, []);

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Calendar Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => eventsQuery.mutate(undefined, { onError: (e: any) => toast.error(e?.message || "Failed to load events") })}
            >
              Refresh Events
            </Button>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Attendees</Label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>
            <div>
              <Label>Duration (mins)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-3">
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
              <button
                key={s.start}
                onClick={() => setSelectedSlot(s)}
                className={
                  "rounded-md border p-3 text-left text-sm hover:bg-muted " +
                  (selectedSlot?.start === s.start ? "ring-2 ring-primary" : "")
                }
              >
                {format(new Date(s.start), "PP p")} – {format(new Date(s.end), "p")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => createEventMut.mutate()} disabled={!selectedSlot || createEventMut.isPending}>
              <Send className="h-4 w-4 mr-2" /> Create Calendar Event
            </Button>
          </div>

          <div className="pt-6">
            <div className="text-sm font-medium mb-2">Upcoming Events</div>
            <div className="space-y-2">
              {(eventsQuery.data?.events || []).length === 0 ? (
                <div className="text-muted-foreground text-sm">No upcoming events. Click Refresh Events.</div>
              ) : (
                eventsQuery.data!.events.map((e: any) => (
                  <div key={e.id} className="rounded-md border p-3 text-sm">
                    <div className="font-medium">{e.summary || "(no title)"}</div>
                    <div className="text-muted-foreground">
                      {format(new Date(e.start?.dateTime || e.start?.date), "PP p")} – {format(new Date(e.end?.dateTime || e.end?.date), "p")}
                    </div>
                    {e.attendees?.length ? (
                      <div className="text-muted-foreground">Attendees: {e.attendees.map((a: any) => a.email).join(", ")}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
