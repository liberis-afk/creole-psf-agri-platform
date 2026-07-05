"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["SEMENCE", "ENGRAIS", "CARBURANT", "MATERIEL", "AUTRE"] as const;
type Category = (typeof CATEGORIES)[number];

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

function parseCategory(value: FormDataEntryValue | null): Category {
  if (typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)) {
    return value as Category;
  }
  return "AUTRE";
}

function parseQuantity(value: FormDataEntryValue | null) {
  const n = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("La quantité doit être un nombre positif");
  }
  return n;
}

export async function createInventoryItem(formData: FormData) {
  const farmId = formData.get("farmId");
  if (typeof farmId !== "string" || !farmId) {
    throw new Error("Ferme requise");
  }

  await requireFarmManager(farmId);

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de l'article est requis");
  }

  const unit = formData.get("unit");
  if (typeof unit !== "string" || !unit.trim()) {
    throw new Error("L'unité est requise");
  }

  await prisma.inventoryItem.create({
    data: {
      farmId,
      name: name.trim(),
      category: parseCategory(formData.get("category")),
      quantity: parseQuantity(formData.get("quantity")),
      unit: unit.trim(),
    },
  });

  revalidatePath("/inventaire");
}

export async function updateInventoryItem(farmId: string, itemId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item || item.farmId !== farmId) {
    throw new Error("Article introuvable");
  }

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Le nom de l'article est requis");
  }

  const unit = formData.get("unit");
  if (typeof unit !== "string" || !unit.trim()) {
    throw new Error("L'unité est requise");
  }

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      name: name.trim(),
      category: parseCategory(formData.get("category")),
      quantity: parseQuantity(formData.get("quantity")),
      unit: unit.trim(),
    },
  });

  revalidatePath("/inventaire");
  revalidatePath(`/inventaire/${itemId}`);
}

export async function deleteInventoryItem(farmId: string, itemId: string) {
  await requireFarmManager(farmId);

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item || item.farmId !== farmId) {
    throw new Error("Article introuvable");
  }

  await prisma.inventoryItem.delete({ where: { id: itemId } });

  revalidatePath("/inventaire");
  redirect("/inventaire");
}
