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
      <p className="text-sm text-muted">
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
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
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
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="stage"
        defaultValue="PLANIFIEE"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {Object.entries(stageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date de plantation
        <input
          name="plantedAt"
          type="date"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <input
        name="expectedYield"
        type="number"
        step="0.01"
        min="0"
        placeholder="Rendement attendu (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Créer la culture
      </button>
    </form>
  );
}
