"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const THEMES = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [emailApproved, setEmailApproved] = useState(true);
  const [emailRejected, setEmailRejected] = useState(true);
  const [emailPending, setEmailPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotifyChange = (label: string) => {
    toast.success(`${label} preferences saved.`);
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-lg bg-secondary" />
        <div className="h-24 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Theme</h3>
        <div className="flex gap-2">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-primary bg-primary/20 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Email Notifications</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Review approved</p>
              <p className="text-xs text-muted-foreground">
                Get notified when your review is approved
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailApproved}
              onChange={(e) => {
                setEmailApproved(e.target.checked);
                handleNotifyChange("Review approved");
              }}
              className="h-4 w-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Review rejected</p>
              <p className="text-xs text-muted-foreground">
                Get notified when your review is rejected
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailRejected}
              onChange={(e) => {
                setEmailRejected(e.target.checked);
                handleNotifyChange("Review rejected");
              }}
              className="h-4 w-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Review pending</p>
              <p className="text-xs text-muted-foreground">
                Get notified when your review is submitted
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPending}
              onChange={(e) => {
                setEmailPending(e.target.checked);
                handleNotifyChange("Review pending");
              }}
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
