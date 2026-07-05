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

export function EditParcelForm({
  action,
  parcel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  parcel: {
    name: string;
    soilType: string | null;
    area: number | null;
    latitude: number | null;
    longitude: number | null;
  };
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    parcel.latitude != null && parcel.longitude != null
      ? [parcel.latitude, parcel.longitude]
      : null,
  );

  return (
    <form action={action} className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <input
          name="name"
          defaultValue={parcel.name}
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <select
          name="soilType"
          defaultValue={parcel.soilType ?? ""}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
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
          defaultValue={parcel.area ?? ""}
          placeholder="Superficie (hectares)"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input type="hidden" name="latitude" value={position?.[0] ?? ""} />
        <input type="hidden" name="longitude" value={position?.[1] ?? ""} />
        <p className="text-sm opacity-70">
          {position
            ? `Position : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            : "Cliquez sur la carte pour situer la parcelle."}
        </p>
        <button
          type="submit"
          className="rounded bg-foreground px-3 py-2 text-background"
        >
          Enregistrer
        </button>
      </div>

      <ParcelMap
        markers={[]}
        pickedPosition={position}
        center={position ?? undefined}
        onPick={(lat, lng) => setPosition([lat, lng])}
        className="h-80 w-full flex-1 overflow-hidden rounded border border-black/10 dark:border-white/10"
      />
    </form>
  );
}
