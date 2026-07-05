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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="stage"
        defaultValue={crop.stage}
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
          defaultValue={toDateInputValue(crop.plantedAt)}
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm opacity-70">
        Date de récolte
        <input
          name="harvestedAt"
          type="date"
          defaultValue={toDateInputValue(crop.harvestedAt)}
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <input
        name="expectedYield"
        type="number"
        step="0.01"
        min="0"
        defaultValue={crop.expectedYield ?? ""}
        placeholder="Rendement attendu"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <input
        name="actualYield"
        type="number"
        step="0.01"
        min="0"
        defaultValue={crop.actualYield ?? ""}
        placeholder="Rendement réel"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Enregistrer
      </button>
    </form>
  );
}
