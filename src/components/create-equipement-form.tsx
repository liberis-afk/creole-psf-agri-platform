import { createEquipement } from "@/app/(dashboard)/equipements/actions";

export function CreateEquipementForm({
  farms,
}: {
  farms: { id: string; name: string }[];
}) {
  if (farms.length === 0) {
    return (
      <p className="text-sm text-muted">
        Vous devez être administrateur ou manager d&apos;une ferme pour ajouter un équipement.
      </p>
    );
  }

  return (
    <form action={createEquipement} className="flex max-w-sm flex-col gap-3">
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
        name="identifiant"
        placeholder="Identifiant (ex: TRAC-001)"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="nom"
        placeholder="Nom de l'équipement"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="type"
        placeholder="Type (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date d&apos;acquisition
        <input
          name="dateAcquisition"
          type="date"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Ajouter l&apos;équipement
      </button>
    </form>
  );
}
