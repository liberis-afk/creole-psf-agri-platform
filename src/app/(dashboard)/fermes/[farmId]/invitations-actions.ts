"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM, getAppUrl } from "@/lib/resend";
import { InvitationEmail } from "@/emails/invitation-email";
import { requireFarmAdmin } from "./actions";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;
type Role = (typeof ROLES)[number];

const INVITATION_TTL_MS = 72 * 60 * 60 * 1000;
const MAX_INVITATIONS_PER_HOUR = 20;

export async function createInvitation(farmId: string, formData: FormData) {
  const userId = await requireFarmAdmin(farmId);

  const emailRaw = formData.get("email");
  const roleRaw = formData.get("role");

  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    throw new Error("Email requis");
  }
  const email = emailRaw.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email invalide");
  }

  const role: Role =
    typeof roleRaw === "string" && (ROLES as readonly string[]).includes(roleRaw)
      ? (roleRaw as Role)
      : "EMPLOYEE";

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_farmId: { userId: existingUser.id, farmId } },
    });
    if (existingMembership) {
      throw new Error("Cet utilisateur est déjà membre de la ferme");
    }
  }

  const activeInvitation = await prisma.invitation.findFirst({
    where: { farmId, email, status: "PENDING" },
  });
  if (activeInvitation) {
    throw new Error(
      "Une invitation est déjà en attente pour cet email. Révoquez-la d'abord pour en renvoyer une nouvelle."
    );
  }

  const recentInvitationCount = await prisma.invitation.count({
    where: {
      invitedById: userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentInvitationCount >= MAX_INVITATIONS_PER_HOUR) {
    throw new Error("Trop d'invitations envoyées récemment. Réessayez plus tard.");
  }

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) {
    throw new Error("Ferme introuvable");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  await prisma.invitation.create({
    data: {
      email,
      role,
      farmId,
      token,
      expiresAt,
      invitedById: userId,
    },
  });

  const inviteUrl = `${getAppUrl()}/invite/${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Invitation à rejoindre ${farm.name} sur CREOLE PSF`,
    react: InvitationEmail({ farmName: farm.name, role, inviteUrl }),
  });

  revalidatePath(`/fermes/${farmId}`);
}

export async function revokeInvitation(farmId: string, invitationId: string) {
  await requireFarmAdmin(farmId);

  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.farmId !== farmId) {
    throw new Error("Invitation introuvable");
  }

  if (invitation.status === "PENDING") {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "REVOKED" },
    });
  }

  revalidatePath(`/fermes/${farmId}`);
}
