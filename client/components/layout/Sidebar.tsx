import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Inbox,
  CalendarClock,
  Settings,
  FileText,
  Filter,
  Star,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Inbox", icon: Inbox },
  { to: "/calendar", label: "Calendar", icon: CalendarClock },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 border-r min-h-[calc(100vh-3.5rem)] p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="w-full justify-start">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>
      <nav className="space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted",
                isActive && "bg-muted text-foreground font-medium",
              )
            }
          >
            <n.icon className="h-4 w-4" />
            <span className="flex-1">{n.label}</span>
            {n.to === "/" && <Badge variant="secondary">New</Badge>}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/20 p-4 text-sm">
        <div className="font-semibold mb-1 flex items-center gap-1">
          <Star className="h-4 w-4" /> Pro tip
        </div>
        Use Smart Scheduling to propose times that automatically adapt to your
        customer’s timezone.
      </div>
    </aside>
  );
}
