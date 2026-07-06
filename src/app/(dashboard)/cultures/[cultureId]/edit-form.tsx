const statusLabels: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ABANDONNEE: "Abandonnée",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EditCultureForm({
  action,
  culture,
}: {
  action: (formData: FormData) => void | Promise<void>;
  culture: {
    nomCulture: string;
    variete: string | null;
    statut: string;
    dateDebut: Date | null;
    dateFin: Date | null;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input
        name="nomCulture"
        defaultValue={culture.nomCulture}
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="variete"
        defaultValue={culture.variete ?? ""}
        placeholder="Variété (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="statut"
        defaultValue={culture.statut}
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date de début
        <input
          name="dateDebut"
          type="date"
          defaultValue={toDateInputValue(culture.dateDebut)}
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date de fin
        <input
          name="dateFin"
          type="date"
          defaultValue={toDateInputValue(culture.dateFin)}
          className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Enregistrer
      </button>
    </form>
  );
}
