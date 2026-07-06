import Link from "next/link";
import { Sprout, MapPin, CalendarDays, Wallet } from "lucide-react";

const highlights = [
  { icon: MapPin, label: "Parcelles géolocalisées" },
  { icon: CalendarDays, label: "Calendrier des cultures" },
  { icon: Wallet, label: "Suivi financier" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--color-emerald-100),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-emerald-900)_35%,transparent),transparent_60%)]"
        aria-hidden
      />

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-emerald-900/20">
        <Sprout className="h-7 w-7" strokeWidth={2} />
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        CREOLE PSF Agri Platform
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Plateforme numérique de gestion agricole multi-exploitations pour les
        fermes en Haïti et ailleurs.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {highlights.map((h) => (
          <span
            key={h.label}
            className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-sm text-stone-600 shadow-sm dark:text-stone-300"
          >
            <h.icon className="h-4 w-4 text-primary" strokeWidth={2} />
            {h.label}
          </span>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
