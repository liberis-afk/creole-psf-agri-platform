"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function createSaison(formData: FormData) {
  const farmId = formData.get("farmId");
  if (typeof farmId !== "string" || !farmId) {
    throw new Error("Ferme requise");
  }

  await requireFarmManager(farmId);

  const nom = formData.get("nom");
  if (typeof nom !== "string" || !nom.trim()) {
    throw new Error("Le nom de la saison est requis");
  }

  const anneeRaw = formData.get("annee");
  const annee = typeof anneeRaw === "string" ? Number.parseInt(anneeRaw, 10) : NaN;
  if (!Number.isFinite(annee)) {
    throw new Error("L'année est requise");
  }

  await prisma.$transaction(async (tx) => {
    await tx.saison.updateMany({
      where: { farmId, statut: "EN_COURS" },
      data: { statut: "TERMINEE", dateFin: new Date() },
    });

    await tx.saison.create({
      data: {
        farmId,
        nom: nom.trim(),
        annee,
        dateDebut: new Date(),
      },
    });
  });

  revalidatePath("/saisons");
}
