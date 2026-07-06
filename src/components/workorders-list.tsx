"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkOrder = {
  id: string;
  type: string;
  description: string;
  statut: string;
  priorite: string;
  dateOuverture: Date;
  dateCloture: Date | null;
  coutEstime: number | null;
  coutReel: number | null;
};

const typeLabels: Record<string, string> = {
  REPARATION: "Réparation",
  MAINTENANCE_PREVENTIVE: "Maintenance préventive",
  INSPECTION: "Inspection",
};

const statusLabels: Record<string, string> = {
  OUVERT: "Ouvert",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

const statusTones: Record<string, "neutral" | "primary" | "success" | "danger"> = {
  OUVERT: "neutral",
  EN_COURS: "primary",
  TERMINE: "success",
  ANNULE: "danger",
};

const prioriteLabels: Record<string, string> = {
  BASSE: "Basse",
  NORMALE: "Normale",
  HAUTE: "Haute",
  URGENTE: "Urgente",
};

function WorkOrderRow({
  workOrder,
  updateAction,
}: {
  workOrder: WorkOrder;
  updateAction: (formData: FormData) => void | Promise<void>;
}) {
  const [statut, setStatut] = useState(workOrder.statut);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
            <ClipboardList className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-medium">{typeLabels[workOrder.type] ?? workOrder.type}</p>
            <p className="text-sm text-muted">{workOrder.description}</p>
            <p className="text-sm text-muted">
              Ouvert le {workOrder.dateOuverture.toLocaleDateString("fr-FR")}
              {workOrder.dateCloture &&
                ` — clôturé le ${workOrder.dateCloture.toLocaleDateString("fr-FR")}`}
            </p>
            {(workOrder.coutEstime != null || workOrder.coutReel != null) && (
              <p className="text-sm text-muted">
                {workOrder.coutEstime != null && `Estimé : ${workOrder.coutEstime}`}
                {workOrder.coutEstime != null && workOrder.coutReel != null && " — "}
                {workOrder.coutReel != null && `Réel : ${workOrder.coutReel}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={statusTones[workOrder.statut] ?? "neutral"}>
            {statusLabels[workOrder.statut] ?? workOrder.statut}
          </Badge>
          <span className="text-xs text-muted">{prioriteLabels[workOrder.priorite]}</span>
        </div>
      </div>

      <form action={updateAction} className="flex items-center gap-2">
        <input type="hidden" name="workOrderId" value={workOrder.id} />
        <select
          name="statut"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface px-2 py-1 text-sm text-foreground shadow-sm outline-none"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {statut === "TERMINE" && (
          <input
            name="coutReel"
            type="number"
            step="0.01"
            min="0"
            defaultValue={workOrder.coutReel ?? ""}
            placeholder="Coût réel"
            className="w-28 rounded-lg border border-surface-border bg-surface px-2 py-1 text-sm text-foreground shadow-sm outline-none"
          />
        )}
        <button
          type="submit"
          className="rounded-lg bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-foreground transition hover:brightness-95"
        >
          Mettre à jour
        </button>
      </form>
    </li>
  );
}

export function WorkOrdersList({
  workOrders,
  createAction,
  updateAction,
}: {
  workOrders: WorkOrder[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
        Historique des work orders
      </h2>

      {workOrders.length === 0 ? (
        <Card className="p-6 text-sm text-muted">Aucun work order pour le moment.</Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {workOrders.map((wo) => (
            <WorkOrderRow key={wo.id} workOrder={wo} updateAction={updateAction} />
          ))}
        </ul>
      )}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Créer un work order
        </h3>
        <form action={createAction} className="flex max-w-sm flex-col gap-3">
          <select
            name="type"
            defaultValue="REPARATION"
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description"
            required
            rows={2}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <select
            name="priorite"
            defaultValue="NORMALE"
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          >
            {Object.entries(prioriteLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="coutEstime"
            type="number"
            step="0.01"
            min="0"
            placeholder="Coût estimé (optionnel)"
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
          >
            Créer le work order
          </button>
        </form>
      </Card>
    </div>
  );
}
