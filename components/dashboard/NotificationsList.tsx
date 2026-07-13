"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

const iconMap: Record<string, typeof CheckCircle> = {
  check: CheckCircle,
  clock: Clock,
  x: XCircle,
  wishlist: BookmarkCheck,
};

const iconColors: Record<string, string> = {
  check: "bg-green-600/30 text-green-400",
  clock: "bg-yellow-600/30 text-yellow-400",
  x: "bg-red-600/30 text-red-400",
  wishlist: "bg-purple-600/30 text-purple-400",
};

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? notifications : notifications.slice(0, 20);

  return (
    <div className="rounded-xl border border-border bg-card">
      {notifications.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Notifications will appear here when your reviews are approved or rejected.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {display.map((n) => {
              const Icon = iconMap[n.icon] ?? Clock;
              const color = iconColors[n.icon] ?? "bg-secondary text-muted-foreground";
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 ${
                    n.read ? "" : "bg-primary/5"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.subtitle}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{n.time}</p>
                </div>
              );
            })}
          </div>
          {notifications.length > 20 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex w-full items-center justify-center gap-1 border-t border-border px-5 py-3 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show All ({notifications.length}) <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
