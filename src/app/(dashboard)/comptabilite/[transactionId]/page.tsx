import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditTransactionForm } from "./edit-form";
import { deleteTransaction, updateTransaction } from "../actions";

const typeLabels: Record<string, string> = {
  DEPENSE: "Dépense",
  REVENU: "Revenu",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const session = await auth();

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { farm: true },
  });

  if (!transaction) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: transaction.farmId } },
      })
    : null;

  if (!membership) {
    notFound();
  }

  const canManage = membership.role === "ADMIN" || membership.role === "MANAGER";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/comptabilite"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toute la comptabilité
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {transaction.description || typeLabels[transaction.type]}
        </h1>
        <p className="text-sm text-muted">{transaction.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditTransactionForm
              action={updateTransaction.bind(null, transaction.farmId, transaction.id)}
              transaction={transaction}
            />
          </Card>
          <form action={deleteTransaction.bind(null, transaction.farmId, transaction.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Supprimer la transaction
            </button>
          </form>
        </>
      ) : (
        <Card className="flex flex-col gap-2 p-5 text-sm">
          <p>Type : {typeLabels[transaction.type] ?? transaction.type}</p>
          <p>Montant : {transaction.amount.toFixed(2)}</p>
          <p>Date : {transaction.date.toLocaleDateString("fr-FR")}</p>
        </Card>
      )}
    </div>
  );
}
