import Link from "next/link";
import { Wrench, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateEquipementForm } from "@/components/create-equipement-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  OPERATIONNEL: "Opérationnel",
  EN_PANNE: "En panne",
  EN_MAINTENANCE: "En maintenance",
  HORS_SERVICE: "Hors service",
};

const statusTones: Record<string, "neutral" | "primary" | "success" | "warning" | "danger"> = {
  OPERATIONNEL: "success",
  EN_PANNE: "danger",
  EN_MAINTENANCE: "warning",
  HORS_SERVICE: "neutral",
};

export default async function EquipementsPage() {
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

  const equipements = farmIds.length
    ? await prisma.equipement.findMany({
        where: { farmId: { in: farmIds } },
        include: { farm: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Équipements"
        description="Tracteurs, outils et matériel — statut et historique de maintenance."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Tous les équipements
        </h2>
        {equipements.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucun équipement pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {equipements.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/equipements/${e.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <Wrench className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {e.identifiant} — {e.nom}
                      </p>
                      <p className="text-sm text-muted">
                        {e.type ?? "Type non précisé"} · {e.farm.name}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTones[e.statut] ?? "neutral"}>
                    {statusLabels[e.statut] ?? e.statut}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ajouter un équipement
        </h2>
        <CreateEquipementForm farms={managerFarms} />
      </Card>
    </div>
  );
}
