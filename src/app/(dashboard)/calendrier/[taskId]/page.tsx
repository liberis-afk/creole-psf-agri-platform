import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EditTaskForm } from "./edit-form";
import { deleteTask, updateTask } from "../actions";

const statusLabels: Record<string, string> = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const session = await auth();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      parcel: { include: { farm: true } },
      crop: { include: { parcelle: { include: { farm: true } } } },
    },
  });

  if (!task) {
    notFound();
  }

  const farm = task.parcel?.farm ?? task.crop?.parcelle.farm;

  const membership = session?.user?.id && farm
    ? await prisma.membership.findUnique({
        where: { userId_farmId: { userId: session.user.id, farmId: farm.id } },
      })
    : null;

  if (!membership || !farm) {
    notFound();
  }

  const canManage = membership.role === "ADMIN" || membership.role === "MANAGER";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/calendrier"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les tâches
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {task.title}
        </h1>
        <p className="text-sm text-muted">
          {farm.name}
          {task.parcel && ` — ${task.parcel.name}`}
          {task.crop && ` — ${task.crop.nomCulture}`}
        </p>
      </div>

      {canManage ? (
        <>
          <Card className="p-5">
            <EditTaskForm action={updateTask.bind(null, farm.id, task.id)} task={task} />
          </Card>
          <form action={deleteTask.bind(null, farm.id, task.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Supprimer la tâche
            </button>
          </form>
        </>
      ) : (
        <Card className="flex flex-col gap-2 p-5 text-sm">
          <p>Statut : {statusLabels[task.status] ?? task.status}</p>
          {task.dueDate && <p>Échéance : {task.dueDate.toLocaleDateString("fr-FR")}</p>}
          {task.notes && <p>Notes : {task.notes}</p>}
        </Card>
      )}
    </div>
  );
}
