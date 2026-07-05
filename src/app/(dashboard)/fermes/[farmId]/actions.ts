"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;
type Role = (typeof ROLES)[number];

async function requireFarmAdmin(farmId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    throw new Error("Action réservée aux administrateurs de la ferme");
  }
}

async function assertNotLastAdmin(farmId: string, membershipId: string) {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership || membership.farmId !== farmId) {
    throw new Error("Membre introuvable");
  }

  if (membership.role === "ADMIN") {
    const adminCount = await prisma.membership.count({ where: { farmId, role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("La ferme doit conserver au moins un administrateur");
    }
  }
}

export async function addMember(farmId: string, formData: FormData) {
  await requireFarmAdmin(farmId);

  const email = formData.get("email");
  const role = formData.get("role");
  const finalRole: Role = typeof role === "string" && (ROLES as readonly string[]).includes(role)
    ? (role as Role)
    : "EMPLOYEE";

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email requis");
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });

  if (!user) {
    throw new Error("Aucun utilisateur avec cet email. Il doit d'abord créer un compte.");
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: user.id, farmId } },
  });

  if (existing) {
    throw new Error("Cet utilisateur est déjà membre de la ferme");
  }

  await prisma.membership.create({
    data: { userId: user.id, farmId, role: finalRole },
  });

  revalidatePath(`/fermes/${farmId}`);
}

export async function updateMemberRole(farmId: string, membershipId: string, formData: FormData) {
  await requireFarmAdmin(farmId);

  const role = formData.get("role");
  if (typeof role !== "string" || !(ROLES as readonly string[]).includes(role)) {
    throw new Error("Rôle invalide");
  }

  if (role !== "ADMIN") {
    await assertNotLastAdmin(farmId, membershipId);
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: role as Role },
  });

  revalidatePath(`/fermes/${farmId}`);
}

export async function removeMember(farmId: string, membershipId: string) {
  await requireFarmAdmin(farmId);
  await assertNotLastAdmin(farmId, membershipId);

  await prisma.membership.delete({ where: { id: membershipId } });

  revalidatePath(`/fermes/${farmId}`);
}
