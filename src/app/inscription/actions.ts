"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function signup(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.trim()) {
    return "Email requis";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }

  const trimmedEmail = email.trim();

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    return "Un compte existe déjà avec cet email";
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email: trimmedEmail,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      password: hashedPassword,
    },
  });

  try {
    await signIn("credentials", {
      email: trimmedEmail,
      password,
      redirectTo: "/fermes",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Compte créé, mais la connexion automatique a échoué. Essayez de vous connecter.";
    }
    throw error;
  }
}
