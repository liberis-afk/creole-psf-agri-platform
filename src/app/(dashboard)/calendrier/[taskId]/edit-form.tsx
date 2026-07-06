const statusLabels: Record<string, string> = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EditTaskForm({
  action,
  task,
}: {
  action: (formData: FormData) => void | Promise<void>;
  task: {
    title: string;
    notes: string | null;
    status: string;
    dueDate: Date | null;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input
        name="title"
        defaultValue={task.title}
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <textarea
        name="notes"
        defaultValue={task.notes ?? ""}
        placeholder="Notes (optionnel)"
        rows={3}
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <select
        name="status"
        defaultValue={task.status}
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
          defaultValue={toDateInputValue(task.dueDate)}
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
