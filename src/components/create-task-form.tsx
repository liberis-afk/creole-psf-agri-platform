import { createTask } from "@/app/(dashboard)/calendrier/actions";

const statusLabels: Record<string, string> = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export function CreateTaskForm({
  parcels,
  crops,
}: {
  parcels: { id: string; name: string; farmName: string }[];
  crops: { id: string; name: string; parcelName: string; farmName: string }[];
}) {
  if (parcels.length === 0 && crops.length === 0) {
    return (
      <p className="text-sm text-muted">
        Vous devez être administrateur ou manager d&apos;une ferme avec au moins une parcelle
        pour créer une tâche.
      </p>
    );
  }

  return (
    <form action={createTask} className="flex max-w-sm flex-col gap-3">
      <select
        name="target"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {parcels.length > 0 && (
          <optgroup label="Parcelles">
            {parcels.map((p) => (
              <option key={p.id} value={`parcel:${p.id}`}>
                {p.name} ({p.farmName})
              </option>
            ))}
          </optgroup>
        )}
        {crops.length > 0 && (
          <optgroup label="Cultures">
            {crops.map((c) => (
              <option key={c.id} value={`crop:${c.id}`}>
                {c.name} — {c.parcelName} ({c.farmName})
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <input
        name="title"
        placeholder="Titre de la tâche"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <textarea
        name="notes"
        placeholder="Notes (optionnel)"
        rows={3}
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="status"
        defaultValue="A_FAIRE"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Échéance
        <input
          name="dueDate"
          type="date"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Créer la tâche
      </button>
    </form>
  );
}
