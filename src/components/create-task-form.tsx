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
      <p className="text-sm opacity-70">
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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <textarea
        name="notes"
        placeholder="Notes (optionnel)"
        rows={3}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="status"
        defaultValue="A_FAIRE"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex flex-col gap-1 text-sm opacity-70">
        Échéance
        <input
          name="dueDate"
          type="date"
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Créer la tâche
      </button>
    </form>
  );
}
