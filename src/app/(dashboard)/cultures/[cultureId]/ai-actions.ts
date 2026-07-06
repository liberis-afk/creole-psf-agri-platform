"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";

export async function getCultureRecommendation(cultureId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: { parcelle: { include: { farm: true } } },
  });

  if (!culture) {
    throw new Error("Culture introuvable");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId: culture.parcelle.farmId } },
  });

  if (!membership) {
    throw new Error("Non autorisé");
  }

  const details = [
    `Culture : ${culture.nomCulture}`,
    culture.variete ? `Variété : ${culture.variete}` : null,
    `Statut : ${culture.statut}`,
    culture.dateDebut ? `Début : ${culture.dateDebut.toISOString().slice(0, 10)}` : null,
    culture.dateFin ? `Fin : ${culture.dateFin.toISOString().slice(0, 10)}` : null,
    `Parcelle : ${culture.parcelle.name}${culture.parcelle.soilType ? ` (sol ${culture.parcelle.soilType})` : ""}`,
    `Ferme : ${culture.parcelle.farm.name}${culture.parcelle.farm.location ? ` — ${culture.parcelle.farm.location}` : ""}`,
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
