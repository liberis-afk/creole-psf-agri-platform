"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createFarm(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const name = formData.get("name");
  const location = formData.get("location");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Le nom de la ferme est requis");
  }

  await prisma.farm.create({
    data: {
      name: name.trim(),
      location: typeof location === "string" && location.trim() ? location.trim() : null,
      memberships: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/fermes");
}
