import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTask, updateTask, deleteTask } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Calendrier actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithParcelAndCrop(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("task-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    const parcel = await prisma.parcelle.create({ data: { farmId: farm.id, name: "Parcelle" } });
    const crop = await prisma.culture.create({
      data: { parcelleId: parcel.id, nomCulture: "Culture" },
    });
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm, parcel, crop };
  }

  it("creates a task targeting a parcel", async () => {
    const { user, parcel } = await setupFarmWithParcelAndCrop("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("target", `parcel:${parcel.id}`);
    formData.set("title", "Irriguer");
    formData.set("status", "A_FAIRE");
    formData.set("dueDate", "2026-07-10");

    await createTask(formData);

    const task = await prisma.task.findFirstOrThrow({ where: { parcelId: parcel.id } });
    expect(task).toMatchObject({ title: "Irriguer", status: "A_FAIRE", cropId: null });
  });

  it("creates a task targeting a crop, deriving its parcel", async () => {
    const { user, parcel, crop } = await setupFarmWithParcelAndCrop("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("target", `crop:${crop.id}`);
    formData.set("title", "Fertiliser");

    await createTask(formData);

    const task = await prisma.task.findFirstOrThrow({ where: { cropId: crop.id } });
    expect(task.parcelId).toBe(parcel.id);
  });

  it("rejects an employee creating a task", async () => {
    const { user, parcel } = await setupFarmWithParcelAndCrop("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("target", `parcel:${parcel.id}`);
    formData.set("title", "Interdit");

    await expect(createTask(formData)).rejects.toThrow(/réservée aux administrateurs et managers/i);
  });

  it("refuses to update or delete a task using another farm's id", async () => {
    const { user, farm, parcel } = await setupFarmWithParcelAndCrop("ADMIN");
    const { farm: otherFarm } = await setupFarmWithParcelAndCrop("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const task = await prisma.task.create({ data: { parcelId: parcel.id, title: "Ma tâche" } });

    const formData = new FormData();
    formData.set("title", "Modifiée");

    // The caller is admin of `farm`, but passes otherFarm's id, which they do
    // NOT administer relative to this task — should be rejected either way.
    await expect(updateTask(otherFarm.id, task.id, formData)).rejects.toThrow();
    await expect(deleteTask(otherFarm.id, task.id)).rejects.toThrow();

    const stillThere = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(stillThere.title).toBe("Ma tâche");

    void farm;
  });

  it("updates and deletes a task with the correct farm id", async () => {
    const { user, farm, parcel } = await setupFarmWithParcelAndCrop("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const task = await prisma.task.create({ data: { parcelId: parcel.id, title: "Ma tâche" } });

    const formData = new FormData();
    formData.set("title", "Modifiée");
    formData.set("status", "TERMINEE");

    await updateTask(farm.id, task.id, formData);
    const updated = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated).toMatchObject({ title: "Modifiée", status: "TERMINEE" });

    await expect(deleteTask(farm.id, task.id)).rejects.toThrow("NEXT_REDIRECT:/calendrier");
    const found = await prisma.task.findUnique({ where: { id: task.id } });
    expect(found).toBeNull();
  });
});
