import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditParcelForm } from "./edit-form";
import { deleteParcel, updateParcel } from "../actions";

const soilLabels: Record<string, string> = {
  ARGILEUX: "Argileux",
  SABLEUX: "Sableux",
  LIMONEUX: "Limoneux",
  CALCAIRE: "Calcaire",
  HUMIFERE: "Humifère",
  AUTRE: "Autre",
};

export default async function ParcelDetailPage({
  params,
}: {
  params: Promise<{ parcelId: string }>;
}) {
  const { parcelId } = await params;
  const session = await auth();

  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: { farm: true },
  });

  if (!parcel) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: parcel.farmId } },
      })
    : null;

  if (!membership) {
    notFound();
  }

  const canManage = membership.role === "ADMIN" || membership.role === "MANAGER";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/parcelles"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les parcelles
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {parcel.name}
        </h1>
        <p className="text-sm text-muted">{parcel.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditParcelForm
              action={updateParcel.bind(null, parcel.farmId, parcel.id)}
              parcel={parcel}
            />
          </Card>
          <form action={deleteParcel.bind(null, parcel.farmId, parcel.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Supprimer la parcelle
            </button>
          </form>
        </>
      ) : (
        <Card className="flex flex-col gap-2 p-5 text-sm">
          {parcel.soilType && <p>Type de sol : {soilLabels[parcel.soilType] ?? parcel.soilType}</p>}
          {parcel.area != null && <p>Superficie : {parcel.area} ha</p>}
          {parcel.latitude != null && parcel.longitude != null && (
            <p>
              Position : {parcel.latitude.toFixed(5)}, {parcel.longitude.toFixed(5)}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
