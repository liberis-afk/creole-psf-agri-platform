import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTransactionForm } from "@/components/create-transaction-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";

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
      <PageHeader
        title="Comptabilité agricole"
        description="Dépenses, revenus et rapports financiers."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Revenus"
          value={totalRevenu.toFixed(2)}
          icon={<TrendingUp className="h-5 w-5" strokeWidth={2} />}
          tone="positive"
        />
        <StatTile
          label="Dépenses"
          value={totalDepense.toFixed(2)}
          icon={<TrendingDown className="h-5 w-5" strokeWidth={2} />}
          tone="negative"
        />
        <StatTile
          label="Solde"
          value={solde.toFixed(2)}
          icon={<Scale className="h-5 w-5" strokeWidth={2} />}
          tone={solde < 0 ? "negative" : "positive"}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Toutes les transactions
        </h2>
        {transactions.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucune transaction pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/comptabilite/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        t.type === "DEPENSE"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}
                    >
                      {t.type === "DEPENSE" ? (
                        <TrendingDown className="h-4.5 w-4.5" strokeWidth={2} />
                      ) : (
                        <TrendingUp className="h-4.5 w-4.5" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{t.description || typeLabels[t.type]}</p>
                      <p className="text-sm text-muted">
                        {t.farm.name} — {t.date.toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      t.type === "DEPENSE"
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {t.type === "DEPENSE" ? "-" : "+"}
                    {t.amount.toFixed(2)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Enregistrer une transaction
        </h2>
        <CreateTransactionForm farms={managerFarms} />
      </Card>
    </div>
  );
}
