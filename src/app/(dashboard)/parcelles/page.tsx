import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateParcelForm } from "@/components/create-parcel-form";
import { ParcelMap } from "@/components/parcel-map-loader";

const soilLabels: Record<string, string> = {
  ARGILEUX: "Argileux",
  SABLEUX: "Sableux",
  LIMONEUX: "Limoneux",
  CALCAIRE: "Calcaire",
  HUMIFERE: "Humifère",
  AUTRE: "Autre",
};

export default async function ParcellesPage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
      })
    : [];

  const farmIds = memberships.map((m) => m.farmId);

  const parcels = farmIds.length
    ? await prisma.parcel.findMany({
        where: { farmId: { in: farmIds } },
        include: { farm: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const managerFarms = memberships
    .filter((m) => m.role === "ADMIN" || m.role === "MANAGER")
    .map((m) => ({ id: m.farmId, name: m.farm.name }));

  const mapMarkers = parcels
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      name: `${p.name} (${p.farm.name})`,
      latitude: p.latitude as number,
      longitude: p.longitude as number,
    }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Parcelles</h1>
        <p className="text-sm opacity-70">
          Géolocalisation, type de sol et superficie des parcelles.
        </p>
      </div>

      {mapMarkers.length > 0 && (
        <ParcelMap
          markers={mapMarkers}
          className="h-80 w-full overflow-hidden rounded border border-black/10 dark:border-white/10"
        />
      )}

      <div>
        <h2 className="mb-2 font-medium">Toutes les parcelles</h2>
        {parcels.length === 0 ? (
          <p className="text-sm opacity-70">Aucune parcelle pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {parcels.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/parcelles/${p.id}`}
                  className="flex items-center justify-between rounded border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03]"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm opacity-70">{p.farm.name}</p>
                  </div>
                  <div className="text-right text-sm opacity-70">
                    {p.soilType && <p>{soilLabels[p.soilType] ?? p.soilType}</p>}
                    {p.area != null && <p>{p.area} ha</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Créer une parcelle</h2>
        <CreateParcelForm farms={managerFarms} />
      </div>
    </div>
  );
}
