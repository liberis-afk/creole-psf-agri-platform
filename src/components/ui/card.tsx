import type { ComponentProps, HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border bg-surface shadow-sm shadow-stone-900/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "block rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]",
        className,
      )}
      {...props}
    />
  );
}
