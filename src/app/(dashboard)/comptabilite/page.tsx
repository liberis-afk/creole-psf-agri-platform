import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTransactionForm } from "@/components/create-transaction-form";

const typeLabels: Record<string, string> = {
  DEPENSE: "Dépense",
  REVENU: "Revenu",
};

export default async function ComptabilitePage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
      })
    : [];

  const farmIds = memberships.map((m) => m.farmId);
  const managerFarms = memberships
    .filter((m) => m.role === "ADMIN" || m.role === "MANAGER")
    .map((m) => ({ id: m.farmId, name: m.farm.name }));

  const transactions = farmIds.length
    ? await prisma.transaction.findMany({
        where: { farmId: { in: farmIds } },
        include: { farm: true },
        orderBy: { date: "desc" },
      })
    : [];

  const totalRevenu = transactions
    .filter((t) => t.type === "REVENU")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDepense = transactions
    .filter((t) => t.type === "DEPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const solde = totalRevenu - totalDepense;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Comptabilité agricole</h1>
        <p className="text-sm opacity-70">Dépenses, revenus et rapports financiers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border border-black/10 px-4 py-3 dark:border-white/10">
          <p className="text-sm opacity-70">Revenus</p>
          <p className="text-xl font-semibold">{totalRevenu.toFixed(2)}</p>
        </div>
        <div className="rounded border border-black/10 px-4 py-3 dark:border-white/10">
          <p className="text-sm opacity-70">Dépenses</p>
          <p className="text-xl font-semibold">{totalDepense.toFixed(2)}</p>
        </div>
        <div className="rounded border border-black/10 px-4 py-3 dark:border-white/10">
          <p className="text-sm opacity-70">Solde</p>
          <p className={`text-xl font-semibold ${solde < 0 ? "text-red-600" : ""}`}>
            {solde.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Toutes les transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm opacity-70">Aucune transaction pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/comptabilite/${t.id}`}
                  className="flex items-center justify-between rounded border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03]"
                >
                  <div>
                    <p className="font-medium">{t.description || typeLabels[t.type]}</p>
                    <p className="text-sm opacity-70">
                      {t.farm.name} — {t.date.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className={t.type === "DEPENSE" ? "text-red-600" : "text-green-600"}>
                    {t.type === "DEPENSE" ? "-" : "+"}
                    {t.amount.toFixed(2)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Enregistrer une transaction</h2>
        <CreateTransactionForm farms={managerFarms} />
      </div>
    </div>
  );
}
