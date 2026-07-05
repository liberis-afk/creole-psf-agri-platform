"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";

export async function getCropRecommendation(cropId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const crop = await prisma.crop.findUnique({
    where: { id: cropId },
    include: { parcel: { include: { farm: true } } },
  });

  if (!crop) {
    throw new Error("Culture introuvable");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId: crop.parcel.farmId } },
  });

  if (!membership) {
    throw new Error("Non autorisé");
  }

  const details = [
    `Culture : ${crop.name}`,
    `Stade : ${crop.stage}`,
    crop.plantedAt ? `Plantée le : ${crop.plantedAt.toISOString().slice(0, 10)}` : null,
    crop.harvestedAt ? `Récoltée le : ${crop.harvestedAt.toISOString().slice(0, 10)}` : null,
    crop.expectedYield != null ? `Rendement attendu : ${crop.expectedYield}` : null,
    crop.actualYield != null ? `Rendement réel : ${crop.actualYield}` : null,
    `Parcelle : ${crop.parcel.name}${crop.parcel.soilType ? ` (sol ${crop.parcel.soilType})` : ""}`,
    `Ferme : ${crop.parcel.farm.name}${crop.parcel.farm.location ? ` — ${crop.parcel.farm.location}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    system:
      "Tu es un agronome qui conseille de petites exploitations agricoles en Haïti et ailleurs. Donne des recommandations courtes, concrètes et actionnables (3 à 5 points), en français, adaptées aux ressources limitées d'une petite ferme.",
    messages: [
      {
        role: "user",
        content: `Voici les informations sur une culture. Donne des recommandations pratiques pour la suite (irrigation, fertilisation, calendrier, risques à surveiller).\n\n${details}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
