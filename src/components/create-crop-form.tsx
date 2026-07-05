import { createCrop } from "@/app/(dashboard)/cultures/actions";

const stageLabels: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  PLANTEE: "Plantée",
  EN_CROISSANCE: "En croissance",
  RECOLTEE: "Récoltée",
  ABANDONNEE: "Abandonnée",
};

export function CreateCropForm({
  parcels,
}: {
  parcels: { id: string; name: string; farmName: string }[];
}) {
  if (parcels.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Vous devez être administrateur ou manager d&apos;une ferme avec au moins une parcelle
        pour créer une culture.
      </p>
    );
  }

  return (
    <form action={createCrop} className="flex max-w-sm flex-col gap-3">
      <select
        name="parcelId"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      >
        {parcels.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.farmName})
          </option>
        ))}
      </select>
      <input
        name="name"
        placeholder="Nom de la culture"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="stage"
        defaultValue="PLANIFIEE"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      >
        {Object.entries(stageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex flex-col gap-1 text-sm opacity-70">
        Date de plantation
        <input
          name="plantedAt"
          type="date"
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <input
        name="expectedYield"
        type="number"
        step="0.01"
        min="0"
        placeholder="Rendement attendu (optionnel)"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Créer la culture
      </button>
    </form>
  );
}
