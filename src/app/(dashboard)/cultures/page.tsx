import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCropForm } from "@/components/create-crop-form";

const stageLabels: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  PLANTEE: "Plantée",
  EN_CROISSANCE: "En croissance",
  RECOLTEE: "Récoltée",
  ABANDONNEE: "Abandonnée",
};

export default async function CulturesPage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
      })
    : [];

  const farmIds = memberships.map((m) => m.farmId);
  const managerFarmIds = memberships
    .filter((m) => m.role === "ADMIN" || m.role === "MANAGER")
    .map((m) => m.farmId);

  const crops = farmIds.length
    ? await prisma.crop.findMany({
        where: { parcel: { farmId: { in: farmIds } } },
        include: { parcel: { include: { farm: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const availableParcels = managerFarmIds.length
    ? await prisma.parcel.findMany({
        where: { farmId: { in: managerFarmIds } },
        include: { farm: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Cultures</h1>
        <p className="text-sm opacity-70">
          Plantation, suivi agronomique, irrigation, fertilisation, récolte.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Toutes les cultures</h2>
        {crops.length === 0 ? (
          <p className="text-sm opacity-70">Aucune culture pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {crops.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cultures/${c.id}`}
                  className="flex items-center justify-between rounded border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03]"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm opacity-70">
                      {c.parcel.name} — {c.parcel.farm.name}
                    </p>
                  </div>
                  <span className="text-sm opacity-70">{stageLabels[c.stage] ?? c.stage}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Créer une culture</h2>
        <CreateCropForm
          parcels={availableParcels.map((p) => ({ id: p.id, name: p.name, farmName: p.farm.name }))}
        />
      </div>
    </div>
  );
}
