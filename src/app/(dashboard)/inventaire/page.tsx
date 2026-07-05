import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateInventoryForm } from "@/components/create-inventory-form";

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
      <div>
        <h1 className="text-2xl font-semibold">Inventaire</h1>
        <p className="text-sm opacity-70">Semences, engrais, carburant et matériel.</p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Tous les articles</h2>
        {items.length === 0 ? (
          <p className="text-sm opacity-70">Aucun article pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/inventaire/${item.id}`}
                  className="flex items-center justify-between rounded border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03]"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm opacity-70">{item.farm.name}</p>
                  </div>
                  <div className="text-right text-sm opacity-70">
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

      <div>
        <h2 className="mb-2 font-medium">Ajouter un article</h2>
        <CreateInventoryForm farms={managerFarms} />
      </div>
    </div>
  );
}
