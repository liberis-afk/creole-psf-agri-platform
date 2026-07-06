import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditCultureForm } from "./edit-form";
import { deleteCulture, terminerCulture, updateCulture } from "../actions";
import { createActivite } from "./activites-actions";
import { CultureRecommendation } from "@/components/culture-recommendation";
import { ActivitesTimeline } from "@/components/activites-timeline";

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

export default async function CultureDetailPage({
  params,
}: {
  params: Promise<{ cultureId: string }>;
}) {
  const { cultureId } = await params;
  const session = await auth();

  const culture = await prisma.culture.findUnique({
    where: { id: cultureId },
    include: {
      parcelle: { include: { farm: true } },
      activites: { orderBy: { date: "desc" } },
    },
  });

  if (!culture) {
    notFound();
  }

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: culture.parcelle.farmId } },
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
          href="/cultures"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les cultures
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {culture.nomCulture}
          </h1>
          <Badge tone={statusTones[culture.statut] ?? "neutral"}>
            {statusLabels[culture.statut] ?? culture.statut}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {culture.parcelle.name} — {culture.parcelle.farm.name}
        </p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditCultureForm
              action={updateCulture.bind(null, culture.parcelle.farmId, culture.id)}
              culture={culture}
            />
          </Card>
          <div className="flex items-center gap-4">
            {culture.statut === "EN_COURS" && (
              <form action={terminerCulture.bind(null, culture.parcelle.farmId, culture.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Terminer la culture
                </button>
              </form>
            )}
            <form action={deleteCulture.bind(null, culture.parcelle.farmId, culture.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Supprimer la culture
              </button>
            </form>
          </div>
        </>
      ) : (
        <Card className="flex flex-col gap-2 p-5 text-sm">
          {culture.variete && <p>Variété : {culture.variete}</p>}
          {culture.dateDebut && <p>Début : {culture.dateDebut.toLocaleDateString("fr-FR")}</p>}
          {culture.dateFin && <p>Fin : {culture.dateFin.toLocaleDateString("fr-FR")}</p>}
        </Card>
      )}

      <CultureRecommendation cultureId={culture.id} />

      <ActivitesTimeline
        activites={culture.activites}
        action={createActivite.bind(null, culture.parcelle.farmId, culture.id)}
      />
    </div>
  );
}
