import { createCulture } from "@/app/(dashboard)/cultures/actions";

export function CreateCultureForm({
  parcelles,
}: {
  parcelles: { id: string; name: string; farmName: string }[];
}) {
  if (parcelles.length === 0) {
    return (
      <p className="text-sm text-muted">
        Vous devez être administrateur ou manager d&apos;une ferme avec au moins une parcelle
        pour créer une culture.
      </p>
    );
  }

  return (
    <form action={createCulture} className="flex max-w-sm flex-col gap-3">
      <select
        name="parcelleId"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {parcelles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.farmName})
          </option>
        ))}
      </select>
      <input
        name="nomCulture"
        placeholder="Nom de la culture"
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="variete"
        placeholder="Variété (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date de début
        <input
          name="dateDebut"
          type="date"
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Créer la culture
      </button>
    </form>
  );
}
