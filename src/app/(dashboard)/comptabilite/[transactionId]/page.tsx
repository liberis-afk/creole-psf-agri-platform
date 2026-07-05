import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
        <Link href="/comptabilite" className="text-sm opacity-70 hover:underline">
          ← Toute la comptabilité
        </Link>
        <h1 className="text-2xl font-semibold">
          {transaction.description || typeLabels[transaction.type]}
        </h1>
        <p className="text-sm opacity-70">{transaction.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <EditTransactionForm
            action={updateTransaction.bind(null, transaction.farmId, transaction.id)}
            transaction={transaction}
          />
          <form action={deleteTransaction.bind(null, transaction.farmId, transaction.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Supprimer la transaction
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p>Type : {typeLabels[transaction.type] ?? transaction.type}</p>
          <p>Montant : {transaction.amount.toFixed(2)}</p>
          <p>Date : {transaction.date.toLocaleDateString("fr-FR")}</p>
        </div>
      )}
    </div>
  );
}
