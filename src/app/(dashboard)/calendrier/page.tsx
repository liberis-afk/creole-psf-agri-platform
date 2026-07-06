import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/create-task-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

const statusTones: Record<string, "neutral" | "primary" | "success" | "danger"> = {
  A_FAIRE: "neutral",
  EN_COURS: "primary",
  TERMINEE: "success",
  ANNULEE: "danger",
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
      <PageHeader
        title="Calendrier agricole"
        description="Planification des tâches, rappels et historique des activités."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Toutes les tâches
        </h2>
        {tasks.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucune tâche pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => {
              const farm = t.parcel?.farm ?? t.crop?.parcel.farm;
              return (
                <li key={t.id}>
                  <Link
                    href={`/calendrier/${t.id}`}
                    className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                        <CalendarDays className="h-4.5 w-4.5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sm text-muted">{farm?.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right text-sm text-muted">
                      <Badge tone={statusTones[t.status] ?? "neutral"}>
                        {statusLabels[t.status] ?? t.status}
                      </Badge>
                      {t.dueDate && <p>{t.dueDate.toLocaleDateString("fr-FR")}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer une tâche
        </h2>
        <CreateTaskForm
          parcels={availableParcels.map((p) => ({ id: p.id, name: p.name, farmName: p.farm.name }))}
          crops={availableCrops.map((c) => ({
            id: c.id,
            name: c.name,
            parcelName: c.parcel.name,
            farmName: c.parcel.farm.name,
          }))}
        />
      </Card>
    </div>
  );
}
