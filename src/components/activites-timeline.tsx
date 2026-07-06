"use client";

import { useMemo, useState } from "react";
import { Droplets, Leaf, Scissors, Sprout, Wheat } from "lucide-react";
import { Card } from "@/components/ui/card";

type Activite = {
  id: string;
  type: string;
  date: Date;
  notes: string | null;
  quantite: number | null;
  unite: string | null;
};

const typeLabels: Record<string, string> = {
  PLANTATION: "Plantation",
  IRRIGATION: "Irrigation",
  APPLICATION: "Application",
  CULTIVATION: "Cultivation",
  RECOLTE: "Récolte",
};

const typeIcons: Record<string, React.ElementType> = {
  PLANTATION: Sprout,
  IRRIGATION: Droplets,
  APPLICATION: Leaf,
  CULTIVATION: Scissors,
  RECOLTE: Wheat,
};

const QUANTITY_TYPES = new Set(["IRRIGATION", "APPLICATION", "RECOLTE"]);

export function ActivitesTimeline({
  activites,
  action,
}: {
  activites: Activite[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("PLANTATION");

  const filtered = useMemo(
    () => (filter === "ALL" ? activites : activites.filter((a) => a.type === filter)),
    [activites, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
          Journal d&apos;activités
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface px-2 py-1 text-sm text-foreground shadow-sm outline-none"
        >
          <option value="ALL">Tous les types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-muted">Aucune activité pour le moment.</Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((a) => {
            const Icon = typeIcons[a.type] ?? Leaf;
            return (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {typeLabels[a.type] ?? a.type}{" "}
                    <span className="text-sm font-normal text-muted">
                      — {a.date.toLocaleDateString("fr-FR")}
                    </span>
                  </p>
                  {a.quantite != null && (
                    <p className="text-sm text-muted">
                      {a.quantite} {a.unite ?? ""}
                    </p>
                  )}
                  {a.notes && <p className="text-sm text-muted">{a.notes}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Ajouter une activité
        </h3>
        <form action={action} className="flex max-w-sm flex-col gap-3">
          <select
            name="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            required
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          {QUANTITY_TYPES.has(selectedType) && (
            <div className="flex gap-2">
              <input
                name="quantite"
                type="number"
                step="0.01"
                min="0"
                placeholder={selectedType === "RECOLTE" ? "Rendement" : "Quantité"}
                className="w-2/3 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <input
                name="unite"
                placeholder={selectedType === "IRRIGATION" ? "litres" : "kg"}
                className="w-1/3 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
          )}
          <textarea
            name="notes"
            placeholder="Notes (optionnel)"
            rows={2}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
          >
            Ajouter l&apos;activité
          </button>
        </form>
      </Card>
    </div>
  );
}
