const categoryLabels: Record<string, string> = {
  SEMENCE: "Semence",
  ENGRAIS: "Engrais",
  CARBURANT: "Carburant",
  MATERIEL: "Matériel",
  AUTRE: "Autre",
};

export function EditInventoryForm({
  action,
  item,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input
        name="name"
        defaultValue={item.name}
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="category"
        defaultValue={item.category}
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
          defaultValue={item.quantity}
          required
          className="w-1/2 rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input
          name="unit"
          defaultValue={item.unit}
          required
          className="w-1/2 rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Enregistrer
      </button>
    </form>
  );
}
