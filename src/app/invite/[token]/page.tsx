import { prisma } from "@/lib/prisma";
import { AcceptInvitationForm } from "./accept-form";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  EMPLOYEE: "Employé",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { farm: true },
  });

  const isExpired = invitation ? invitation.expiresAt < new Date() : false;
  const isValid = !!invitation && invitation.status === "PENDING" && !isExpired;

  if (!invitation || !isValid) {
    const message = !invitation
      ? "Ce lien d'invitation n'existe pas."
      : invitation.status === "ACCEPTED"
        ? "Cette invitation a déjà été acceptée."
        : invitation.status === "REVOKED"
          ? "Cette invitation a été révoquée."
          : "Cette invitation a expiré.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-8 text-center shadow-lg shadow-stone-900/[0.04]">
          <h1 className="text-xl font-semibold tracking-tight">Invitation invalide</h1>
          <p className="mt-2 text-sm text-muted">{message}</p>
        </div>
      </div>
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });

  return (
    <AcceptInvitationForm
      token={token}
      email={invitation.email}
      farmName={invitation.farm.name}
      roleLabel={roleLabels[invitation.role] ?? invitation.role}
      isNewUser={!existingUser}
    />
  );
}
