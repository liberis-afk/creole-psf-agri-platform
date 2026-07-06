"use client";

import { useState } from "react";
import { ParcelMap } from "./parcel-map-loader";
import { createParcel } from "@/app/(dashboard)/parcelles/actions";

const soilLabels: Record<string, string> = {
  ARGILEUX: "Argileux",
  SABLEUX: "Sableux",
  LIMONEUX: "Limoneux",
  CALCAIRE: "Calcaire",
  HUMIFERE: "Humifère",
  AUTRE: "Autre",
};

export function CreateParcelForm({
  farms,
}: {
  farms: { id: string; name: string }[];
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  if (farms.length === 0) {
    return (
      <p className="text-sm text-muted">
        Vous devez être administrateur ou manager d&apos;une ferme pour créer une parcelle.
      </p>
    );
  }

  return (
    <form action={createParcel} className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <select
          name="farmId"
          required
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        >
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <input
          name="name"
          placeholder="Nom de la parcelle"
          required
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <select
          name="soilType"
          defaultValue=""
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        >
          <option value="">Type de sol (optionnel)</option>
          {Object.entries(soilLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="area"
          type="number"
          step="0.01"
          min="0"
          placeholder="Superficie (hectares)"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <input type="hidden" name="latitude" value={position?.[0] ?? ""} />
        <input type="hidden" name="longitude" value={position?.[1] ?? ""} />
        <p className="text-sm text-muted">
          {position
            ? `Position choisie : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            : "Cliquez sur la carte pour situer la parcelle (optionnel)."}
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
        >
          Créer la parcelle
        </button>
      </div>

      <ParcelMap
        markers={[]}
        pickedPosition={position}
        onPick={(lat, lng) => setPosition([lat, lng])}
        className="h-80 w-full flex-1 overflow-hidden rounded-xl border border-surface-border shadow-sm shadow-stone-900/[0.03]"
      />
    </form>
  );
}
