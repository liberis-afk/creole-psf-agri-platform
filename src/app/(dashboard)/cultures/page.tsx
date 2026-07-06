import Link from "next/link";
import { Sprout, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCultureForm } from "@/components/create-culture-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ABANDONNEE: "Abandonnée",
};

const statusTones: Record<string, "neutral" | "primary" | "success" | "danger"> = {
  EN_COURS: "primary",
  TERMINEE: "success",
  ABANDONNEE: "danger",
};

export default async function CulturesPage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
      })
    : [];

  const farmIds = memberships.map((m) => m.farmId);
  const managerFarmIds = memberships
    .filter((m) => m.role === "ADMIN" || m.role === "MANAGER")
    .map((m) => m.farmId);

  const cultures = farmIds.length
    ? await prisma.culture.findMany({
        where: { parcelle: { farmId: { in: farmIds } } },
        include: { parcelle: { include: { farm: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const availableParcelles = managerFarmIds.length
    ? await prisma.parcelle.findMany({
        where: { farmId: { in: managerFarmIds } },
        include: { farm: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cultures"
        description="Plantation, suivi agronomique, irrigation, fertilisation, récolte."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Toutes les cultures
        </h2>
        {cultures.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucune culture pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {cultures.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cultures/${c.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <Sprout className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium">{c.nomCulture}</p>
                      <p className="text-sm text-muted">
                        {c.parcelle.name} — {c.parcelle.farm.name}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTones[c.statut] ?? "neutral"}>
                    {statusLabels[c.statut] ?? c.statut}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer une culture
        </h2>
        <CreateCultureForm
          parcelles={availableParcelles.map((p) => ({ id: p.id, name: p.name, farmName: p.farm.name }))}
        />
      </Card>
    </div>
  );
}
