import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      <div>
        <h1 className="text-2xl font-semibold">Fermes</h1>
        <p className="text-sm opacity-70">
          Création et gestion des exploitations, membres et rôles.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Vos fermes</h2>
        {memberships.length === 0 ? (
          <p className="text-sm opacity-70">Vous n&apos;appartenez à aucune ferme pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {memberships.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <div>
                  <p className="font-medium">{m.farm.name}</p>
                  {m.farm.location && (
                    <p className="text-sm opacity-70">{m.farm.location}</p>
                  )}
                </div>
                <span className="text-sm opacity-70">{roleLabels[m.role] ?? m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Créer une nouvelle ferme</h2>
        <form action={createFarm} className="flex max-w-sm flex-col gap-3">
          <input
            name="name"
            placeholder="Nom de la ferme"
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
          <input
            name="location"
            placeholder="Localisation (optionnel)"
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
          <button
            type="submit"
            className="rounded bg-foreground px-3 py-2 text-background"
          >
            Créer la ferme
          </button>
        </form>
      </div>
    </div>
  );
}
