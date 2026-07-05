import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditCropForm } from "./edit-form";
import { deleteCrop, updateCrop } from "../actions";

const stageLabels: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  PLANTEE: "Plantée",
  EN_CROISSANCE: "En croissance",
  RECOLTEE: "Récoltée",
  ABANDONNEE: "Abandonnée",
};

export default async function CropDetailPage({
  params,
}: {
  params: Promise<{ cropId: string }>;
}) {
  const { cropId } = await params;
  const session = await auth();

  const crop = await prisma.crop.findUnique({
    where: { id: cropId },
    include: { parcel: { include: { farm: true } } },
  });

  if (!crop) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: crop.parcel.farmId } },
      })
    : null;

  if (!membership) {
    notFound();
  }

  const canManage = membership.role === "ADMIN" || membership.role === "MANAGER";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/cultures" className="text-sm opacity-70 hover:underline">
          ← Toutes les cultures
        </Link>
        <h1 className="text-2xl font-semibold">{crop.name}</h1>
        <p className="text-sm opacity-70">
          {crop.parcel.name} — {crop.parcel.farm.name}
        </p>
      </div>

      {canManage ? (
        <>
          <EditCropForm
            action={updateCrop.bind(null, crop.parcel.farmId, crop.id)}
            crop={crop}
          />
          <form action={deleteCrop.bind(null, crop.parcel.farmId, crop.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Supprimer la culture
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p>Stade : {stageLabels[crop.stage] ?? crop.stage}</p>
          {crop.plantedAt && <p>Plantée le : {crop.plantedAt.toLocaleDateString("fr-FR")}</p>}
          {crop.harvestedAt && <p>Récoltée le : {crop.harvestedAt.toLocaleDateString("fr-FR")}</p>}
          {crop.expectedYield != null && <p>Rendement attendu : {crop.expectedYield}</p>}
          {crop.actualYield != null && <p>Rendement réel : {crop.actualYield}</p>}
        </div>
      )}
    </div>
  );
}
