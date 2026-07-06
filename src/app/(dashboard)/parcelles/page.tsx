import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateParcelForm } from "@/components/create-parcel-form";
import { ParcelMap } from "@/components/parcel-map-loader";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

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
      <PageHeader
        title="Parcelles"
        description="Géolocalisation, type de sol et superficie des parcelles."
      />

      {mapMarkers.length > 0 && (
        <ParcelMap
          markers={mapMarkers}
          className="h-80 w-full overflow-hidden rounded-xl border border-surface-border shadow-sm shadow-stone-900/[0.03]"
        />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Toutes les parcelles
        </h2>
        {parcels.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucune parcelle pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {parcels.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/parcelles/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <MapPin className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted">{p.farm.name}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted">
                    {p.soilType && <p>{soilLabels[p.soilType] ?? p.soilType}</p>}
                    {p.area != null && <p>{p.area} ha</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer une parcelle
        </h2>
        <CreateParcelForm farms={managerFarms} />
      </Card>
    </div>
  );
}
