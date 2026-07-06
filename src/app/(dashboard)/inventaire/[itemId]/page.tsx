import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditInventoryForm } from "./edit-form";
import { deleteInventoryItem, updateInventoryItem } from "../actions";

const categoryLabels: Record<string, string> = {
  SEMENCE: "Semence",
  ENGRAIS: "Engrais",
  CARBURANT: "Carburant",
  MATERIEL: "Matériel",
  AUTRE: "Autre",
};

export default async function InventoryItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const session = await auth();

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: { farm: true },
  });

  if (!item) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: item.farmId } },
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
          href="/inventaire"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Tout l&apos;inventaire
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {item.name}
        </h1>
        <p className="text-sm text-muted">{item.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditInventoryForm
              action={updateInventoryItem.bind(null, item.farmId, item.id)}
              item={item}
            />
          </Card>
          <form action={deleteInventoryItem.bind(null, item.farmId, item.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Supprimer l&apos;article
            </button>
          </form>
        </>
      ) : (
        <Card className="flex flex-col gap-2 p-5 text-sm">
          <p>Catégorie : {categoryLabels[item.category] ?? item.category}</p>
          <p>
            Quantité : {item.quantity} {item.unit}
          </p>
        </Card>
      )}
    </div>
  );
}
