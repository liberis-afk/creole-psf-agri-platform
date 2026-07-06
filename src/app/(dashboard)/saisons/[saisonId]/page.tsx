import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sprout } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const saisonStatusLabels: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
};

const saisonStatusTones: Record<string, "neutral" | "primary"> = {
  EN_COURS: "primary",
  TERMINEE: "neutral",
};

const cultureStatusLabels: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ABANDONNEE: "Abandonnée",
};

const cultureStatusTones: Record<string, "neutral" | "primary" | "success" | "danger"> = {
  EN_COURS: "primary",
  TERMINEE: "success",
  ABANDONNEE: "danger",
};

export default async function SaisonDetailPage({
  params,
}: {
  params: Promise<{ saisonId: string }>;
}) {
  const { saisonId } = await params;
  const session = await auth();

  const saison = await prisma.saison.findUnique({
    where: { id: saisonId },
    include: { farm: true },
  });

  if (!saison) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: saison.farmId } },
      })
    : null;

  if (!membership) {
    notFound();
  }

  const cultures = await prisma.culture.findMany({
    where: { saisonId: saison.id },
    include: { parcelle: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/saisons"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les saisons
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {saison.nom} {saison.annee}
          </h1>
          <Badge tone={saisonStatusTones[saison.statut] ?? "neutral"}>
            {saisonStatusLabels[saison.statut] ?? saison.statut}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {saison.farm.name}
          {saison.dateDebut && ` — début le ${saison.dateDebut.toLocaleDateString("fr-FR")}`}
          {saison.dateFin && ` — fin le ${saison.dateFin.toLocaleDateString("fr-FR")}`}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Cultures de cette saison
        </h2>
        {cultures.length === 0 ? (
          <Card className="p-6 text-sm text-muted">
            Aucune culture n&apos;a été rattachée à cette saison.
          </Card>
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
                      <p className="text-sm text-muted">{c.parcelle.name}</p>
                    </div>
                  </div>
                  <Badge tone={cultureStatusTones[c.statut] ?? "neutral"}>
                    {cultureStatusLabels[c.statut] ?? c.statut}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
