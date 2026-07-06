"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Sprout,
  CalendarDays,
  CalendarRange,
  Boxes,
  Wrench,
  Wallet,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/cn";

const modules = [
  { href: "/fermes", label: "Fermes", icon: Home },
  { href: "/saisons", label: "Saisons", icon: CalendarRange },
  { href: "/parcelles", label: "Parcelles", icon: MapPin },
  { href: "/cultures", label: "Cultures", icon: Sprout },
  { href: "/calendrier", label: "Calendrier", icon: CalendarDays },
  { href: "/inventaire", label: "Inventaire", icon: Boxes },
  { href: "/equipements", label: "Équipements", icon: Wrench },
  { href: "/comptabilite", label: "Comptabilité", icon: Wallet },
  { href: "/assistant", label: "Assistant IA", icon: Bot },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {modules.map((m) => {
        const isActive = pathname === m.href || pathname.startsWith(`${m.href}/`);
        const Icon = m.icon;
        return (
          <li key={m.href}>
            <Link
              href={m.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {m.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
