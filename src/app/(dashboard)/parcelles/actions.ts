"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SOIL_TYPES = ["ARGILEUX", "SABLEUX", "LIMONEUX", "CALCAIRE", "HUMIFERE", "AUTRE"] as const;
type SoilType = (typeof SOIL_TYPES)[number];

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

function parseSoilType(value: FormDataEntryValue | null): SoilType | null {
  if (typeof value === "string" && (SOIL_TYPES as readonly string[]).includes(value)) {
    return value as SoilType;
  }
  return null;
}

function parseFloatOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createParcel(formData: FormData) {
  const farmId = formData.get("farmId");
  if (typeof farmId !== "string" || !farmId) {
    throw new Error("Ferme requise");
  }

  await requireFarmManager(farmId);

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de la parcelle est requis");
  }

  await prisma.parcel.create({
    data: {
      farmId,
      name: name.trim(),
      latitude: parseFloatOrNull(formData.get("latitude")),
      longitude: parseFloatOrNull(formData.get("longitude")),
      area: parseFloatOrNull(formData.get("area")),
      soilType: parseSoilType(formData.get("soilType")),
    },
  });

  revalidatePath("/parcelles");
}

export async function updateParcel(farmId: string, parcelId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
  if (!parcel || parcel.farmId !== farmId) {
    throw new Error("Parcelle introuvable");
  }

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de la parcelle est requis");
  }

  await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      name: name.trim(),
      latitude: parseFloatOrNull(formData.get("latitude")),
      longitude: parseFloatOrNull(formData.get("longitude")),
      area: parseFloatOrNull(formData.get("area")),
      soilType: parseSoilType(formData.get("soilType")),
    },
  });

  revalidatePath("/parcelles");
  revalidatePath(`/parcelles/${parcelId}`);
}

export async function deleteParcel(farmId: string, parcelId: string) {
  await requireFarmManager(farmId);

  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
  if (!parcel || parcel.farmId !== farmId) {
    throw new Error("Parcelle introuvable");
  }

  await prisma.parcel.delete({ where: { id: parcelId } });

  revalidatePath("/parcelles");
  redirect("/parcelles");
}
