function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function EditTransactionForm({
  action,
  transaction,
}: {
  action: (formData: FormData) => void | Promise<void>;
  transaction: {
    type: string;
    amount: number;
    description: string | null;
    date: Date;
  };
}) {
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <select
        name="type"
        defaultValue={transaction.type}
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        <option value="DEPENSE">Dépense</option>
        <option value="REVENU">Revenu</option>
      </select>
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        defaultValue={transaction.amount}
        required
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <input
        name="description"
        defaultValue={transaction.description ?? ""}
        placeholder="Description (optionnel)"
        className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <label className="flex flex-col gap-1 text-sm text-muted">
        Date
        <input
          name="date"
          type="date"
          defaultValue={toDateInputValue(transaction.date)}
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
