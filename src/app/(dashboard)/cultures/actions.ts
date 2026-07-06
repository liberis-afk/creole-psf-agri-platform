"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["EN_COURS", "TERMINEE", "ABANDONNEE"] as const;
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
  return "EN_COURS";
}

function parseDateOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCulture(formData: FormData) {
  const parcelleId = formData.get("parcelleId");
  if (typeof parcelleId !== "string" || !parcelleId) {
    throw new Error("Parcelle requise");
  }

  const parcelle = await prisma.parcelle.findUnique({ where: { id: parcelleId } });
  if (!parcelle) {
    throw new Error("Parcelle introuvable");
  }

  await requireFarmManager(parcelle.farmId);

  const nomCulture = formData.get("nomCulture");
  if (typeof nomCulture !== "string" || !nomCulture.trim()) {
    throw new Error("Le nom de la culture est requis");
  }

  const activeCulture = await prisma.culture.findFirst({
    where: { parcelleId, statut: "EN_COURS" },
  });
  if (activeCulture) {
    throw new Error("Cette parcelle a déjà une culture en cours");
  }

  const variete = formData.get("variete");

  await prisma.culture.create({
    data: {
      parcelleId,
      nomCulture: nomCulture.trim(),
      variete: typeof variete === "string" && variete.trim() ? variete.trim() : null,
      dateDebut: parseDateOrNull(formData.get("dateDebut")),
    },
  });

  revalidatePath("/cultures");
}

export async function updateCulture(farmId: string, cultureId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: { parcelle: true },
  });
  if (!culture || culture.parcelle.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  const nomCulture = formData.get("nomCulture");
  if (typeof nomCulture !== "string" || !nomCulture.trim()) {
    throw new Error("Le nom de la culture est requis");
  }

  const variete = formData.get("variete");

  await prisma.culture.update({
    where: { id: cultureId },
    data: {
      nomCulture: nomCulture.trim(),
      variete: typeof variete === "string" && variete.trim() ? variete.trim() : null,
      statut: parseStatus(formData.get("statut")),
      dateDebut: parseDateOrNull(formData.get("dateDebut")),
      dateFin: parseDateOrNull(formData.get("dateFin")),
    },
  });

  revalidatePath("/cultures");
  revalidatePath(`/cultures/${cultureId}`);
}

export async function terminerCulture(farmId: string, cultureId: string) {
  await requireFarmManager(farmId);

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: { parcelle: true },
  });
  if (!culture || culture.parcelle.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  if (culture.statut !== "EN_COURS") {
    throw new Error("Cette culture n'est pas en cours");
  }

  await prisma.culture.update({
    where: { id: cultureId },
    data: { statut: "TERMINEE", dateFin: culture.dateFin ?? new Date() },
  });

  revalidatePath("/cultures");
  revalidatePath(`/cultures/${cultureId}`);
}

export async function deleteCulture(farmId: string, cultureId: string) {
  await requireFarmManager(farmId);

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: { parcelle: true },
  });
  if (!culture || culture.parcelle.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  await prisma.culture.delete({ where: { id: cultureId } });

  revalidatePath("/cultures");
  redirect("/cultures");
}
