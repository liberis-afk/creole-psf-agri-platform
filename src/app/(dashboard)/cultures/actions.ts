"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAGES = ["PLANIFIEE", "PLANTEE", "EN_CROISSANCE", "RECOLTEE", "ABANDONNEE"] as const;
type Stage = (typeof STAGES)[number];

async function requireFarmManager(farmId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId } },
  });

  if (!membership || (membership.role !== "ADMIN" && membership.role !== "MANAGER")) {
    throw new Error("Action réservée aux administrateurs et managers de la ferme");
  }
}

function parseStage(value: FormDataEntryValue | null): Stage {
  if (typeof value === "string" && (STAGES as readonly string[]).includes(value)) {
    return value as Stage;
  }
  return "PLANIFIEE";
}

function parseFloatOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseDateOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCrop(formData: FormData) {
  const parcelId = formData.get("parcelId");
  if (typeof parcelId !== "string" || !parcelId) {
    throw new Error("Parcelle requise");
  }

  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
  if (!parcel) {
    throw new Error("Parcelle introuvable");
  }

  await requireFarmManager(parcel.farmId);

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de la culture est requis");
  }

  await prisma.crop.create({
    data: {
      parcelId,
      name: name.trim(),
      stage: parseStage(formData.get("stage")),
      plantedAt: parseDateOrNull(formData.get("plantedAt")),
      expectedYield: parseFloatOrNull(formData.get("expectedYield")),
    },
  });

  revalidatePath("/cultures");
}

export async function updateCrop(farmId: string, cropId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const crop = await prisma.crop.findUnique({ where: { id: cropId }, include: { parcel: true } });
  if (!crop || crop.parcel.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de la culture est requis");
  }

  await prisma.crop.update({
    where: { id: cropId },
    data: {
      name: name.trim(),
      stage: parseStage(formData.get("stage")),
      plantedAt: parseDateOrNull(formData.get("plantedAt")),
      harvestedAt: parseDateOrNull(formData.get("harvestedAt")),
      expectedYield: parseFloatOrNull(formData.get("expectedYield")),
      actualYield: parseFloatOrNull(formData.get("actualYield")),
    },
  });

  revalidatePath("/cultures");
  revalidatePath(`/cultures/${cropId}`);
}

export async function deleteCrop(farmId: string, cropId: string) {
  await requireFarmManager(farmId);

  const crop = await prisma.crop.findUnique({ where: { id: cropId }, include: { parcel: true } });
  if (!crop || crop.parcel.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  await prisma.crop.delete({ where: { id: cropId } });

  revalidatePath("/cultures");
  redirect("/cultures");
}
