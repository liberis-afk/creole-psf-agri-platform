import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/create-task-form";

const statusLabels: Record<string, string> = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export default async function CalendrierPage() {
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

  const tasks = farmIds.length
    ? await prisma.task.findMany({
        where: {
          OR: [
            { parcel: { farmId: { in: farmIds } } },
            { crop: { parcel: { farmId: { in: farmIds } } } },
          ],
        },
        include: {
          parcel: { include: { farm: true } },
          crop: { include: { parcel: { include: { farm: true } } } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      })
    : [];

  const availableParcels = managerFarmIds.length
    ? await prisma.parcel.findMany({
        where: { farmId: { in: managerFarmIds } },
        include: { farm: true },
        orderBy: { name: "asc" },
      })
    : [];

  const availableCrops = managerFarmIds.length
    ? await prisma.crop.findMany({
        where: { parcel: { farmId: { in: managerFarmIds } } },
        include: { parcel: { include: { farm: true } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Calendrier agricole</h1>
        <p className="text-sm opacity-70">
          Planification des tâches, rappels et historique des activités.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Toutes les tâches</h2>
        {tasks.length === 0 ? (
          <p className="text-sm opacity-70">Aucune tâche pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => {
              const farm = t.parcel?.farm ?? t.crop?.parcel.farm;
              return (
                <li key={t.id}>
                  <Link
                    href={`/calendrier/${t.id}`}
                    className="flex items-center justify-between rounded border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03]"
                  >
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm opacity-70">{farm?.name}</p>
                    </div>
                    <div className="text-right text-sm opacity-70">
                      <p>{statusLabels[t.status] ?? t.status}</p>
                      {t.dueDate && <p>{t.dueDate.toLocaleDateString("fr-FR")}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Créer une tâche</h2>
        <CreateTaskForm
          parcels={availableParcels.map((p) => ({ id: p.id, name: p.name, farmName: p.farm.name }))}
          crops={availableCrops.map((c) => ({
            id: c.id,
            name: c.name,
            parcelName: c.parcel.name,
            farmName: c.parcel.farm.name,
          }))}
        />
      </div>
    </div>
  );
}
