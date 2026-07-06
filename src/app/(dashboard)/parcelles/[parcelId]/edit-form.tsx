"use client";

import { useState } from "react";
import { ParcelMap } from "@/components/parcel-map-loader";

const soilLabels: Record<string, string> = {
  ARGILEUX: "Argileux",
  SABLEUX: "Sableux",
  LIMONEUX: "Limoneux",
  CALCAIRE: "Calcaire",
  HUMIFERE: "Humifère",
  AUTRE: "Autre",
};

export function EditParcelleForm({
  action,
  parcelle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  parcelle: {
    name: string;
    soilType: string | null;
    area: number | null;
    latitude: number | null;
    longitude: number | null;
  };
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    parcelle.latitude != null && parcelle.longitude != null
      ? [parcelle.latitude, parcelle.longitude]
      : null,
  );

  return (
    <form action={action} className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <input
          name="name"
          defaultValue={parcelle.name}
          required
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <select
          name="soilType"
          defaultValue={parcelle.soilType ?? ""}
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
          defaultValue={parcelle.area ?? ""}
          placeholder="Superficie (hectares)"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <input type="hidden" name="latitude" value={position?.[0] ?? ""} />
        <input type="hidden" name="longitude" value={position?.[1] ?? ""} />
        <p className="text-sm text-muted">
          {position
            ? `Position : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            : "Cliquez sur la carte pour situer la parcelle."}
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
        >
          Enregistrer
        </button>
      </div>

      <ParcelMap
        markers={[]}
        pickedPosition={position}
        center={position ?? undefined}
        onPick={(lat, lng) => setPosition([lat, lng])}
        className="h-80 w-full flex-1 overflow-hidden rounded-xl border border-surface-border"
      />
    </form>
  );
}
