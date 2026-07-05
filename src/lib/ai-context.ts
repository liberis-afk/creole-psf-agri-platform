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
          parcels: { include: { crops: true } },
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
    for (const parcel of m.farm.parcels) {
      lines.push(
        `  - Parcelle "${parcel.name}"${parcel.soilType ? `, sol ${parcel.soilType}` : ""}${parcel.area ? `, ${parcel.area} ha` : ""}`,
      );
      for (const crop of parcel.crops) {
        lines.push(
          `      - Culture "${crop.name}", stade ${crop.stage}${crop.plantedAt ? `, plantée le ${crop.plantedAt.toISOString().slice(0, 10)}` : ""}${crop.expectedYield ? `, rendement attendu ${crop.expectedYield}` : ""}`,
        );
      }
    }
  }

  return lines.join("\n");
}
