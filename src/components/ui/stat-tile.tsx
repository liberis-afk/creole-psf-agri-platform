import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

export function StatTile({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p
          className={cn(
            "text-xl font-semibold tracking-tight",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-red-600 dark:text-red-400",
          )}
        >
          {value}
        </p>
      </div>
    </Card>
  );
}
