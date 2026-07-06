import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function buildFarmContext(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    return "L'utilisateur n'est pas connecté.";
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      farm: {
        include: {
          parcelles: { include: { cultures: true } },
        },
      },
    },
  });

  if (memberships.length === 0) {
    return "L'utilisateur n'appartient à aucune ferme pour le moment.";
  }

  const lines: string[] = [];
  for (const m of memberships) {
    lines.push(`Ferme "${m.farm.name}" (${m.farm.location ?? "localisation inconnue"}), rôle de l'utilisateur : ${m.role}`);
    for (const parcelle of m.farm.parcelles) {
      lines.push(
        `  - Parcelle "${parcelle.name}"${parcelle.soilType ? `, sol ${parcelle.soilType}` : ""}${parcelle.area ? `, ${parcelle.area} ha` : ""}`,
      );
      for (const culture of parcelle.cultures) {
        lines.push(
          `      - Culture "${culture.nomCulture}", statut ${culture.statut}${culture.dateDebut ? `, début le ${culture.dateDebut.toISOString().slice(0, 10)}` : ""}`,
        );
      }
    }
  }

  return lines.join("\n");
}
