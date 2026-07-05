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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <textarea
        name="notes"
        defaultValue={task.notes ?? ""}
        placeholder="Notes (optionnel)"
        rows={3}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <select
        name="status"
        defaultValue={task.status}
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
          defaultValue={toDateInputValue(task.dueDate)}
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Enregistrer
      </button>
    </form>
  );
}
