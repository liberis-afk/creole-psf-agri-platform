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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
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
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <input
        name="description"
        defaultValue={transaction.description ?? ""}
        placeholder="Description (optionnel)"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <label className="flex flex-col gap-1 text-sm opacity-70">
        Date
        <input
          name="date"
          type="date"
          defaultValue={toDateInputValue(transaction.date)}
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
