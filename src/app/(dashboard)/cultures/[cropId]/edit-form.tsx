const stageLabels: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  PLANTEE: "Plantée",
  EN_CROISSANCE: "En croissance",
  RECOLTEE: "Récoltée",
  ABANDONNEE: "Abandonnée",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EditCropForm({
  action,
  crop,
}: {
  action: (formData: FormData) => void | Promise<void>;
  crop: {
    name: string;
    stage: string;
    plantedAt: Date | null;
    harvestedAt: Date | null;
    expectedYield: number | null;
    actualYield: number | null;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input
        name="name"
        defaultValue={crop.name}
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="stage"
        defaultValue={crop.stage}
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
          defaultValue={toDateInputValue(crop.plantedAt)}
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date de récolte
        <input
          name="harvestedAt"
          type="date"
          defaultValue={toDateInputValue(crop.harvestedAt)}
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <input
        name="expectedYield"
        type="number"
        step="0.01"
        min="0"
        defaultValue={crop.expectedYield ?? ""}
        placeholder="Rendement attendu"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="actualYield"
        type="number"
        step="0.01"
        min="0"
        defaultValue={crop.actualYield ?? ""}
        placeholder="Rendement réel"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Enregistrer
      </button>
    </form>
  );
}
