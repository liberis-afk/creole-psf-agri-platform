"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function acceptInvitation(
  token: string,
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const password = formData.get("password");
  const name = formData.get("name");

  if (typeof password !== "string" || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) {
    return "Invitation introuvable";
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });

  if (existingUser) {
    const passwordMatches =
      existingUser.password && (await bcrypt.compare(password, existingUser.password));
    if (!passwordMatches) {
      return "Mot de passe incorrect";
    }
  }

  const hashedPassword = existingUser ? null : await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const resolved = await tx.invitation.updateMany({
        where: { id: invitation.id, status: "PENDING", expiresAt: { gt: new Date() } },
        data: { status: "ACCEPTED" },
      });

      if (resolved.count === 0) {
        throw new Error("Invitation invalide ou expirée");
      }

      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email: invitation.email,
            name: typeof name === "string" && name.trim() ? name.trim() : null,
            password: hashedPassword,
          },
        }));

      const existingMembership = await tx.membership.findUnique({
        where: { userId_farmId: { userId: user.id, farmId: invitation.farmId } },
      });

      if (!existingMembership) {
        await tx.membership.create({
          data: { userId: user.id, farmId: invitation.farmId, role: invitation.role },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: invitation.email,
      password,
      redirectTo: `/fermes/${invitation.farmId}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invitation acceptée, mais la connexion automatique a échoué. Essayez de vous connecter.";
    }
    throw error;
  }
}
