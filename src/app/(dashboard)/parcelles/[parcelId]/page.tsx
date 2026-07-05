import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
        <Link href="/parcelles" className="text-sm opacity-70 hover:underline">
          ← Toutes les parcelles
        </Link>
        <h1 className="text-2xl font-semibold">{parcel.name}</h1>
        <p className="text-sm opacity-70">{parcel.farm.name}</p>
      </div>

      {canManage ? (
        <>
          <EditParcelForm
            action={updateParcel.bind(null, parcel.farmId, parcel.id)}
            parcel={parcel}
          />
          <form action={deleteParcel.bind(null, parcel.farmId, parcel.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Supprimer la parcelle
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          {parcel.soilType && <p>Type de sol : {soilLabels[parcel.soilType] ?? parcel.soilType}</p>}
          {parcel.area != null && <p>Superficie : {parcel.area} ha</p>}
          {parcel.latitude != null && parcel.longitude != null && (
            <p>
              Position : {parcel.latitude.toFixed(5)}, {parcel.longitude.toFixed(5)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
