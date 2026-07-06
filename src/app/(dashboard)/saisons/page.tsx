import Link from "next/link";
import { CalendarRange, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateSaisonForm } from "@/components/create-saison-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SaisonsPage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
      })
    : [];

  const farmIds = memberships.map((m) => m.farmId);
  const managerFarms = memberships
    .filter((m) => m.role === "ADMIN" || m.role === "MANAGER")
    .map((m) => ({ id: m.farmId, name: m.farm.name }));

  const saisons = farmIds.length
    ? await prisma.saison.findMany({
        where: { farmId: { in: farmIds } },
        include: { farm: true },
        orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const enCours = saisons.filter((s) => s.statut === "EN_COURS");
  const historique = saisons.filter((s) => s.statut === "TERMINEE");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Saisons"
        description="Regroupe les cultures d'une ferme sur une période donnée."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Saison en cours
        </h2>
        {enCours.length === 0 ? (
          <Card className="p-6 text-sm text-muted">Aucune saison en cours pour le moment.</Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {enCours.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/saisons/${s.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <CalendarRange className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {s.nom} {s.annee}
                      </p>
                      <p className="text-sm text-muted">{s.farm.name}</p>
                    </div>
                  </div>
                  <Badge tone="primary">En cours</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {historique.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
            Historique
          </h2>
          <ul className="flex flex-col gap-2">
            {historique.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/saisons/${s.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div>
                    <p className="font-medium">
                      {s.nom} {s.annee}
                    </p>
                    <p className="text-sm text-muted">{s.farm.name}</p>
                  </div>
                  <Badge tone="neutral">Terminée</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouvelle saison
        </h2>
        <CreateSaisonForm farms={managerFarms} />
        <p className="mt-3 text-sm text-muted">
          Créer une nouvelle saison clôture automatiquement la saison en cours de cette ferme.
        </p>
      </Card>
    </div>
  );
}
