"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireFarmManager } from "../actions";

const TYPES = ["REPARATION", "MAINTENANCE_PREVENTIVE", "INSPECTION"] as const;
type Type = (typeof TYPES)[number];

const STATUSES = ["OUVERT", "EN_COURS", "TERMINE", "ANNULE"] as const;
type Status = (typeof STATUSES)[number];

const PRIORITES = ["BASSE", "NORMALE", "HAUTE", "URGENTE"] as const;
type Priorite = (typeof PRIORITES)[number];

function parseType(value: FormDataEntryValue | null): Type {
  if (typeof value === "string" && (TYPES as readonly string[]).includes(value)) {
    return value as Type;
  }
  return "REPARATION";
}

function parseStatus(value: FormDataEntryValue | null): Status {
  if (typeof value === "string" && (STATUSES as readonly string[]).includes(value)) {
    return value as Status;
  }
  return "OUVERT";
}

function parsePriorite(value: FormDataEntryValue | null): Priorite {
  if (typeof value === "string" && (PRIORITES as readonly string[]).includes(value)) {
    return value as Priorite;
  }
  return "NORMALE";
}

function parseFloatOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createWorkOrder(farmId: string, equipementId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const equipement = await prisma.equipement.findUnique({ where: { id: equipementId } });
  if (!equipement || equipement.farmId !== farmId) {
    throw new Error("Équipement introuvable");
  }

  const description = formData.get("description");
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("La description est requise");
  }

  await prisma.workOrder.create({
    data: {
      equipementId,
      type: parseType(formData.get("type")),
      description: description.trim(),
      priorite: parsePriorite(formData.get("priorite")),
      coutEstime: parseFloatOrNull(formData.get("coutEstime")),
    },
  });

  revalidatePath(`/equipements/${equipementId}`);
}

export async function updateWorkOrderStatut(farmId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const workOrderId = formData.get("workOrderId");
  if (typeof workOrderId !== "string" || !workOrderId) {
    throw new Error("Work order introuvable");
  }

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { equipement: true },
  });
  if (!workOrder || workOrder.equipement.farmId !== farmId) {
    throw new Error("Work order introuvable");
  }

  const statut = parseStatus(formData.get("statut"));
  const coutReel = parseFloatOrNull(formData.get("coutReel"));

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      statut,
      dateCloture: statut === "TERMINE" ? (workOrder.dateCloture ?? new Date()) : workOrder.dateCloture,
      coutReel: coutReel ?? workOrder.coutReel,
    },
  });

  revalidatePath(`/equipements/${workOrder.equipementId}`);
}
