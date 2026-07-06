import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleSelectForm } from "@/components/role-select-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeMember, updateMemberRole } from "./actions";
import { createInvitation, revokeInvitation } from "./invitations-actions";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
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
        <Link
          href="/fermes"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les fermes
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {farm.name}
        </h1>
        {farm.location && <p className="text-sm text-muted">{farm.location}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
          Membres
        </h2>
        <ul className="flex flex-col gap-2">
          {farm.memberships.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary-soft-foreground">
                  {initials(m.user.name ?? m.user.email)}
                </div>
                <div>
                  <p className="font-medium">{m.user.name ?? m.user.email}</p>
                  <p className="text-sm text-muted">{m.user.email}</p>
                </div>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <RoleSelectForm
                    action={updateMemberRole.bind(null, farmId, m.id)}
                    defaultValue={m.role}
                  />
                  <form action={removeMember.bind(null, farmId, m.id)}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </form>
                </div>
              ) : (
                <Badge tone="primary">{roleLabels[m.role] ?? m.role}</Badge>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && farm.invitations.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-stone-500 dark:text-stone-400">
            Invitations en attente
          </h2>
          <ul className="flex flex-col gap-2">
            {farm.invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface p-4 shadow-sm shadow-stone-900/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
                    <Mail className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted">
                      {roleLabels[invitation.role] ?? invitation.role} — expire le{" "}
                      {invitation.expiresAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <form action={revokeInvitation.bind(null, farmId, invitation.id)}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Révoquer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdmin && (
        <Card className="max-w-sm p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
            <UserPlus className="h-4 w-4" strokeWidth={2} />
            Inviter un membre
          </h2>
          <form action={createInvitation.bind(null, farmId)} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email à inviter"
              required
              className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            <select
              name="role"
              defaultValue="EMPLOYEE"
              className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover"
            >
              Envoyer l&apos;invitation
            </button>
          </form>
          <p className="mt-3 text-sm text-muted">
            Un email d&apos;invitation sera envoyé, valable 72 heures.
          </p>
        </Card>
      )}
    </div>
  );
}
