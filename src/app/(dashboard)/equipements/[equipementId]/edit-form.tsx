const statusLabels: Record<string, string> = {
  OPERATIONNEL: "Opérationnel",
  EN_PANNE: "En panne",
  EN_MAINTENANCE: "En maintenance",
  HORS_SERVICE: "Hors service",
};

export function EditEquipementForm({
  action,
  equipement,
}: {
  action: (formData: FormData) => void | Promise<void>;
  equipement: {
    nom: string;
    type: string | null;
    statut: string;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input
        name="nom"
        defaultValue={equipement.nom}
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="type"
        defaultValue={equipement.type ?? ""}
        placeholder="Type (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="statut"
        defaultValue={equipement.statut}
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
      >
        Enregistrer
      </button>
    </form>
  );
}
