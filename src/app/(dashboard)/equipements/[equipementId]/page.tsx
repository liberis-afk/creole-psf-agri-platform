import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkOrdersList } from "@/components/workorders-list";
import { EditEquipementForm } from "./edit-form";
import { deleteEquipement, updateEquipement } from "../actions";
import { createWorkOrder, updateWorkOrderStatut } from "./workorders-actions";

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

export default async function EquipementDetailPage({
  params,
}: {
  params: Promise<{ equipementId: string }>;
}) {
  const { equipementId } = await params;
  const session = await auth();

  const equipement = await prisma.equipement.findUnique({
    where: { id: equipementId },
    include: {
      farm: true,
      workOrders: { orderBy: { dateOuverture: "desc" } },
    },
  });

  if (!equipement) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: equipement.farmId } },
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
          href="/equipements"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Tous les équipements
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {equipement.identifiant} — {equipement.nom}
          </h1>
          <Badge tone={statusTones[equipement.statut] ?? "neutral"}>
            {statusLabels[equipement.statut] ?? equipement.statut}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {equipement.type ?? "Type non précisé"} · {equipement.farm.name}
        </p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditEquipementForm
              action={updateEquipement.bind(null, equipement.farmId, equipement.id)}
              equipement={equipement}
            />
          </Card>
          <form action={deleteEquipement.bind(null, equipement.farmId, equipement.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Supprimer l&apos;équipement
            </button>
          </form>
        </>
      ) : (
        equipement.dateAcquisition && (
          <Card className="flex flex-col gap-2 p-5 text-sm">
            <p>Acquis le {equipement.dateAcquisition.toLocaleDateString("fr-FR")}</p>
          </Card>
        )
      )}

      <WorkOrdersList
        workOrders={equipement.workOrders}
        createAction={createWorkOrder.bind(null, equipement.farmId, equipement.id)}
        updateAction={updateWorkOrderStatut.bind(null, equipement.farmId)}
      />
    </div>
  );
}
