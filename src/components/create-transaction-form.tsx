import { createTransaction } from "@/app/(dashboard)/comptabilite/actions";

export function CreateTransactionForm({
  farms,
}: {
  farms: { id: string; name: string }[];
}) {
  if (farms.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Vous devez être administrateur ou manager d&apos;une ferme pour enregistrer une
        transaction.
      </p>
    );
  }

  return (
    <form action={createTransaction} className="flex max-w-sm flex-col gap-3">
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
      <select
        name="type"
        defaultValue="DEPENSE"
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
        placeholder="Montant"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <input
        name="description"
        placeholder="Description (optionnel)"
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
      />
      <label className="flex flex-col gap-1 text-sm opacity-70">
        Date
        <input
          name="date"
          type="date"
          className="rounded border border-black/20 px-3 py-2 text-base opacity-100 dark:border-white/20"
        />
      </label>
      <button
        type="submit"
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Enregistrer la transaction
      </button>
    </form>
  );
}
