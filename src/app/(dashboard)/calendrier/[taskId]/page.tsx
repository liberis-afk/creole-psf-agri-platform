import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      crop: { include: { parcel: { include: { farm: true } } } },
    },
  });

  if (!task) {
    notFound();
  }

  const farm = task.parcel?.farm ?? task.crop?.parcel.farm;

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
        <Link href="/calendrier" className="text-sm opacity-70 hover:underline">
          ← Toutes les tâches
        </Link>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-sm opacity-70">
          {farm.name}
          {task.parcel && ` — ${task.parcel.name}`}
          {task.crop && ` — ${task.crop.name}`}
        </p>
      </div>

      {canManage ? (
        <>
          <EditTaskForm action={updateTask.bind(null, farm.id, task.id)} task={task} />
          <form action={deleteTask.bind(null, farm.id, task.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Supprimer la tâche
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p>Statut : {statusLabels[task.status] ?? task.status}</p>
          {task.dueDate && <p>Échéance : {task.dueDate.toLocaleDateString("fr-FR")}</p>}
          {task.notes && <p>Notes : {task.notes}</p>}
        </div>
      )}
    </div>
  );
}
