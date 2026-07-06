import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWorkOrder, updateWorkOrderStatut } from "./workorders-actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("WorkOrder actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithEquipement(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("wo-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    const equipement = await prisma.equipement.create({
      data: { farmId: farm.id, identifiant: `WO-${Date.now()}`, nom: "Tracteur" },
    });
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm, equipement };
  }

  it("lets a manager create a work order", async () => {
    const { user, farm, equipement } = await setupFarmWithEquipement("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("type", "REPARATION");
    formData.set("description", "Fuite d'huile");
    formData.set("priorite", "HAUTE");
    formData.set("coutEstime", "150");

    await createWorkOrder(farm.id, equipement.id, formData);

    const workOrder = await prisma.workOrder.findFirstOrThrow({
      where: { equipementId: equipement.id },
    });
    expect(workOrder).toMatchObject({
      type: "REPARATION",
      description: "Fuite d'huile",
      priorite: "HAUTE",
      statut: "OUVERT",
      coutEstime: 150,
    });
  });

  it("rejects an employee creating a work order", async () => {
    const { user, farm, equipement } = await setupFarmWithEquipement("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("type", "INSPECTION");
    formData.set("description", "Interdit");

    await expect(createWorkOrder(farm.id, equipement.id, formData)).rejects.toThrow(
      /réservée aux administrateurs et managers/i,
    );
  });

  it("closes a work order with a real cost and sets dateCloture", async () => {
    const { user, farm, equipement } = await setupFarmWithEquipement("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const workOrder = await prisma.workOrder.create({
      data: { equipementId: equipement.id, type: "MAINTENANCE_PREVENTIVE", description: "Vidange" },
    });

    const formData = new FormData();
    formData.set("workOrderId", workOrder.id);
    formData.set("statut", "TERMINE");
    formData.set("coutReel", "80");

    await updateWorkOrderStatut(farm.id, formData);

    const updated = await prisma.workOrder.findUniqueOrThrow({ where: { id: workOrder.id } });
    expect(updated.statut).toBe("TERMINE");
    expect(updated.coutReel).toBe(80);
    expect(updated.dateCloture).not.toBeNull();
  });

  it("rejects updating a work order belonging to a different farm's equipement", async () => {
    const { user, farm } = await setupFarmWithEquipement("ADMIN");
    const { equipement: otherEquipement } = await setupFarmWithEquipement("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const otherWorkOrder = await prisma.workOrder.create({
      data: { equipementId: otherEquipement.id, type: "INSPECTION", description: "Autre ferme" },
    });

    const formData = new FormData();
    formData.set("workOrderId", otherWorkOrder.id);
    formData.set("statut", "EN_COURS");

    await expect(updateWorkOrderStatut(farm.id, formData)).rejects.toThrow(/introuvable/i);
  });
});
