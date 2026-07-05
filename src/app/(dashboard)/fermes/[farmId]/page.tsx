import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleSelectForm } from "@/components/role-select-form";
import { addMember, removeMember, updateMemberRole } from "./actions";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
};

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const { farmId } = await params;
  const session = await auth();

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!farm) {
    notFound();
  }

  const currentMembership = farm.memberships.find((m) => m.userId === session?.user?.id);

  if (!currentMembership) {
    notFound();
  }

  const isAdmin = currentMembership.role === "ADMIN";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/fermes" className="text-sm opacity-70 hover:underline">
          ← Toutes les fermes
        </Link>
        <h1 className="text-2xl font-semibold">{farm.name}</h1>
        {farm.location && <p className="text-sm opacity-70">{farm.location}</p>}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Membres</h2>
        <ul className="flex flex-col gap-2">
          {farm.memberships.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-4 rounded border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div>
                <p className="font-medium">{m.user.name ?? m.user.email}</p>
                <p className="text-sm opacity-70">{m.user.email}</p>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <RoleSelectForm
                    action={updateMemberRole.bind(null, farmId, m.id)}
                    defaultValue={m.role}
                  />
                  <form action={removeMember.bind(null, farmId, m.id)}>
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </form>
                </div>
              ) : (
                <span className="text-sm opacity-70">{roleLabels[m.role] ?? m.role}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div>
          <h2 className="mb-2 font-medium">Ajouter un membre</h2>
          <form action={addMember.bind(null, farmId)} className="flex max-w-sm flex-col gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email de l'utilisateur"
              required
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
            <select
              name="role"
              defaultValue="EMPLOYEE"
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-foreground px-3 py-2 text-background"
            >
              Ajouter
            </button>
          </form>
          <p className="mt-2 text-sm opacity-70">
            L&apos;utilisateur doit déjà avoir un compte sur la plateforme.
          </p>
        </div>
      )}
    </div>
  );
}
