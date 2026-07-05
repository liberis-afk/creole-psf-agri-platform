import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
        <Link href="/inventaire" className="text-sm opacity-70 hover:underline">
          ← Tout l&apos;inventaire
        </Link>
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <p className="text-sm opacity-70">{item.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <EditInventoryForm
            action={updateInventoryItem.bind(null, item.farmId, item.id)}
            item={item}
          />
          <form action={deleteInventoryItem.bind(null, item.farmId, item.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Supprimer l&apos;article
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p>Catégorie : {categoryLabels[item.category] ?? item.category}</p>
          <p>
            Quantité : {item.quantity} {item.unit}
          </p>
        </div>
      )}
    </div>
  );
}
