import { createInventoryItem } from "@/app/(dashboard)/inventaire/actions";

const categoryLabels: Record<string, string> = {
  SEMENCE: "Semence",
  ENGRAIS: "Engrais",
  CARBURANT: "Carburant",
  MATERIEL: "Matériel",
  AUTRE: "Autre",
};

export function CreateInventoryForm({
  farms,
}: {
  farms: { id: string; name: string }[];
}) {
  if (farms.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Vous devez être administrateur ou manager d&apos;une ferme pour ajouter un article
        d&apos;inventaire.
      </p>
    );
  }

  return (
    <form action={createInventoryItem} className="flex max-w-sm flex-col gap-3">
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
        placeholder="Nom de l'article"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="category"
        defaultValue="AUTRE"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      >
        {Object.entries(categoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="flex gap-3">
        <input
          name="quantity"
          type="number"
          step="0.01"
          min="0"
          placeholder="Quantité"
          required
          className="w-1/2 rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input
          name="unit"
          placeholder="Unité (kg, L, sacs...)"
          required
          className="w-1/2 rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Ajouter à l&apos;inventaire
      </button>
    </form>
  );
}
