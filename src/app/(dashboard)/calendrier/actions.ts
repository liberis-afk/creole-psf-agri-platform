"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["A_FAIRE", "EN_COURS", "TERMINEE", "ANNULEE"] as const;
type Status = (typeof STATUSES)[number];

async function requireFarmManager(farmId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId } },
  });

  if (!membership || (membership.role !== "ADMIN" && membership.role !== "MANAGER")) {
    throw new Error("Action réservée aux administrateurs et managers de la ferme");
  }
}

function parseStatus(value: FormDataEntryValue | null): Status {
  if (typeof value === "string" && (STATUSES as readonly string[]).includes(value)) {
    return value as Status;
  }
  return "A_FAIRE";
}

function parseDateOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createTask(formData: FormData) {
  const target = formData.get("target");
  if (typeof target !== "string" || !target.includes(":")) {
    throw new Error("Une parcelle ou une culture doit être sélectionnée");
  }
  const [targetType, targetId] = target.split(":");

  let parcelId: string;
  let cropId: string | null = null;
  let farmId: string;

  if (targetType === "crop") {
    const crop = await prisma.culture.findUnique({
      where: { id: targetId },
      include: { parcelle: true },
    });
    if (!crop) {
      throw new Error("Culture introuvable");
    }
    cropId = crop.id;
    parcelId = crop.parcelleId;
    farmId = crop.parcelle.farmId;
  } else {
    const parcel = await prisma.parcelle.findUnique({ where: { id: targetId } });
    if (!parcel) {
      throw new Error("Parcelle introuvable");
    }
    parcelId = parcel.id;
    farmId = parcel.farmId;
  }

  await requireFarmManager(farmId);

  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Le titre de la tâche est requis");
  }

  const notes = formData.get("notes");

  await prisma.task.create({
    data: {
      title: title.trim(),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      status: parseStatus(formData.get("status")),
      dueDate: parseDateOrNull(formData.get("dueDate")),
      parcelId,
      cropId,
    },
  });

  revalidatePath("/calendrier");
}

async function assertTaskBelongsToFarm(taskId: string, farmId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { parcel: true, crop: { include: { parcelle: true } } },
  });

  const taskFarmId = task?.parcel?.farmId ?? task?.crop?.parcelle.farmId;
  if (!task || taskFarmId !== farmId) {
    throw new Error("Tâche introuvable");
  }
}

export async function updateTask(farmId: string, taskId: string, formData: FormData) {
  await requireFarmManager(farmId);
  await assertTaskBelongsToFarm(taskId, farmId);

  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Le titre de la tâche est requis");
  }

  const notes = formData.get("notes");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: title.trim(),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      status: parseStatus(formData.get("status")),
      dueDate: parseDateOrNull(formData.get("dueDate")),
    },
  });

  revalidatePath("/calendrier");
  revalidatePath(`/calendrier/${taskId}`);
}

export async function deleteTask(farmId: string, taskId: string) {
  await requireFarmManager(farmId);
  await assertTaskBelongsToFarm(taskId, farmId);

  await prisma.task.delete({ where: { id: taskId } });

  revalidatePath("/calendrier");
  redirect("/calendrier");
}
