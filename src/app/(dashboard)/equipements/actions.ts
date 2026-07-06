"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const STATUSES = ["OPERATIONNEL", "EN_PANNE", "EN_MAINTENANCE", "HORS_SERVICE"] as const;
type Status = (typeof STATUSES)[number];

export async function requireFarmManager(farmId: string) {
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

  return session.user.id;
}

function parseStatus(value: FormDataEntryValue | null): Status {
  if (typeof value === "string" && (STATUSES as readonly string[]).includes(value)) {
    return value as Status;
  }
  return "OPERATIONNEL";
}

function parseDateOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createEquipement(formData: FormData) {
  const farmId = formData.get("farmId");
  if (typeof farmId !== "string" || !farmId) {
    throw new Error("Ferme requise");
  }

  await requireFarmManager(farmId);

  const identifiant = formData.get("identifiant");
  if (typeof identifiant !== "string" || !identifiant.trim()) {
    throw new Error("L'identifiant est requis");
  }

  const nom = formData.get("nom");
  if (typeof nom !== "string" || !nom.trim()) {
    throw new Error("Le nom de l'équipement est requis");
  }

  const type = formData.get("type");

  try {
    await prisma.equipement.create({
      data: {
        farmId,
        identifiant: identifiant.trim(),
        nom: nom.trim(),
        type: typeof type === "string" && type.trim() ? type.trim() : null,
        dateAcquisition: parseDateOrNull(formData.get("dateAcquisition")),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Un équipement avec cet identifiant existe déjà pour cette ferme");
    }
    throw error;
  }

  revalidatePath("/equipements");
}

export async function updateEquipement(farmId: string, equipementId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const equipement = await prisma.equipement.findUnique({ where: { id: equipementId } });
  if (!equipement || equipement.farmId !== farmId) {
    throw new Error("Équipement introuvable");
  }

  const nom = formData.get("nom");
  if (typeof nom !== "string" || !nom.trim()) {
    throw new Error("Le nom de l'équipement est requis");
  }

  const type = formData.get("type");

  await prisma.equipement.update({
    where: { id: equipementId },
    data: {
      nom: nom.trim(),
      type: typeof type === "string" && type.trim() ? type.trim() : null,
      statut: parseStatus(formData.get("statut")),
    },
  });

  revalidatePath("/equipements");
  revalidatePath(`/equipements/${equipementId}`);
}

export async function deleteEquipement(farmId: string, equipementId: string) {
  await requireFarmManager(farmId);

  const equipement = await prisma.equipement.findUnique({ where: { id: equipementId } });
  if (!equipement || equipement.farmId !== farmId) {
    throw new Error("Équipement introuvable");
  }

  await prisma.equipement.delete({ where: { id: equipementId } });

  revalidatePath("/equipements");
  redirect("/equipements");
}
