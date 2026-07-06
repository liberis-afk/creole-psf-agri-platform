import Link from "next/link";
import { Boxes, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateInventoryForm } from "@/components/create-inventory-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  SEMENCE: "Semence",
  ENGRAIS: "Engrais",
  CARBURANT: "Carburant",
  MATERIEL: "Matériel",
  AUTRE: "Autre",
};

export default async function InventairePage() {
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

  const items = farmIds.length
    ? await prisma.inventoryItem.findMany({
        where: { farmId: { in: farmIds } },
        include: { farm: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Inventaire" description="Semences, engrais, carburant et matériel." />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Tous les articles
        </h2>
        {items.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucun article pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/inventaire/${item.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <Boxes className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted">{item.farm.name}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p>{categoryLabels[item.category] ?? item.category}</p>
                    <p>
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ajouter un article
        </h2>
        <CreateInventoryForm farms={managerFarms} />
      </Card>
    </div>
  );
}
