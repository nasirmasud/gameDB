"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface FieldTooltipProps {
  show: boolean;
  message: string;
  variant?: "error" | "success" | "info";
}

export function FieldTooltip({ show, message, variant = "error" }: FieldTooltipProps) {
  const iconMap = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  };
  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-out",
        show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs leading-tight",
            variant === "error" && "text-destructive",
            variant === "success" && "text-emerald-500",
            variant === "info" && "text-muted-foreground"
          )}
        >
          <Icon className="size-3 shrink-0" />
          {message}
        </p>
      </div>
    </div>
  );
}
