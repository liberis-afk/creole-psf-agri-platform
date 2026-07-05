"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPES = ["DEPENSE", "REVENU"] as const;
type TxType = (typeof TYPES)[number];

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

function parseType(value: FormDataEntryValue | null): TxType {
  if (typeof value === "string" && (TYPES as readonly string[]).includes(value)) {
    return value as TxType;
  }
  return "DEPENSE";
}

function parseAmount(value: FormDataEntryValue | null) {
  const n = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Le montant doit être un nombre positif");
  }
  return n;
}

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function createTransaction(formData: FormData) {
  const farmId = formData.get("farmId");
  if (typeof farmId !== "string" || !farmId) {
    throw new Error("Ferme requise");
  }

  await requireFarmManager(farmId);

  const description = formData.get("description");

  await prisma.transaction.create({
    data: {
      farmId,
      type: parseType(formData.get("type")),
      amount: parseAmount(formData.get("amount")),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      date: parseDate(formData.get("date")),
    },
  });

  revalidatePath("/comptabilite");
}

export async function updateTransaction(farmId: string, transactionId: string, formData: FormData) {
  await requireFarmManager(farmId);

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction || transaction.farmId !== farmId) {
    throw new Error("Transaction introuvable");
  }

  const description = formData.get("description");

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      type: parseType(formData.get("type")),
      amount: parseAmount(formData.get("amount")),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      date: parseDate(formData.get("date")),
    },
  });

  revalidatePath("/comptabilite");
  revalidatePath(`/comptabilite/${transactionId}`);
}

export async function deleteTransaction(farmId: string, transactionId: string) {
  await requireFarmManager(farmId);

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction || transaction.farmId !== farmId) {
    throw new Error("Transaction introuvable");
  }

  await prisma.transaction.delete({ where: { id: transactionId } });

  revalidatePath("/comptabilite");
  redirect("/comptabilite");
}
