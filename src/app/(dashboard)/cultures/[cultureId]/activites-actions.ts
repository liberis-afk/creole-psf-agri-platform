"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireFarmManager } from "../actions";

const TYPES = ["PLANTATION", "IRRIGATION", "APPLICATION", "CULTIVATION", "RECOLTE"] as const;
type Type = (typeof TYPES)[number];

function parseType(value: FormDataEntryValue | null): Type {
  if (typeof value === "string" && (TYPES as readonly string[]).includes(value)) {
    return value as Type;
  }
  return "PLANTATION";
}

function parseFloatOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseDateOrNow(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function createActivite(farmId: string, cultureId: string, formData: FormData) {
  const userId = await requireFarmManager(farmId);

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: { parcelle: true },
  });
  if (!culture || culture.parcelle.farmId !== farmId) {
    throw new Error("Culture introuvable");
  }

  const notes = formData.get("notes");
  const unite = formData.get("unite");

  await prisma.activite.create({
    data: {
      cultureId,
      type: parseType(formData.get("type")),
      date: parseDateOrNow(formData.get("date")),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      quantite: parseFloatOrNull(formData.get("quantite")),
      unite: typeof unite === "string" && unite.trim() ? unite.trim() : null,
      createdById: userId,
    },
  });

  revalidatePath(`/cultures/${cultureId}`);
}
