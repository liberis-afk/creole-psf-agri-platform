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
      <p className="text-sm opacity-70">
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
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
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
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <select
          name="soilType"
          defaultValue=""
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
          placeholder="Superficie (hectares)"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input type="hidden" name="latitude" value={position?.[0] ?? ""} />
        <input type="hidden" name="longitude" value={position?.[1] ?? ""} />
        <p className="text-sm opacity-70">
          {position
            ? `Position choisie : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            : "Cliquez sur la carte pour situer la parcelle (optionnel)."}
        </p>
        <button
          type="submit"
          className="rounded bg-foreground px-3 py-2 text-background"
        >
          Créer la parcelle
        </button>
      </div>

      <ParcelMap
        markers={[]}
        pickedPosition={position}
        onPick={(lat, lng) => setPosition([lat, lng])}
        className="h-80 w-full flex-1 overflow-hidden rounded border border-black/10 dark:border-white/10"
      />
    </form>
  );
}
