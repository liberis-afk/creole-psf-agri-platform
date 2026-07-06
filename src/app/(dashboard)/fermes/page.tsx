import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createFarm } from "./actions";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
};

export default async function FermesPage() {
  const session = await auth();

  const memberships = session?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { farm: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fermes"
        description="Création et gestion des exploitations, membres et rôles."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Vos fermes
        </h2>
        {memberships.length === 0 ? (
          <Card className="p-6 text-sm text-muted">
            Vous n&apos;appartenez à aucune ferme pour le moment.
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/fermes/${m.farmId}`}
                  className="flex h-full flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <Home className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                    <Badge tone="primary">{roleLabels[m.role] ?? m.role}</Badge>
                  </div>
                  <div>
                    <p className="font-medium">{m.farm.name}</p>
                    {m.farm.location && (
                      <p className="text-sm text-muted">{m.farm.location}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="max-w-sm p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer une nouvelle ferme
        </h2>
        <form action={createFarm} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Nom de la ferme"
            required
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <input
            name="location"
            placeholder="Localisation (optionnel)"
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
          >
            Créer la ferme
          </button>
        </form>
      </Card>
    </div>
  );
}
