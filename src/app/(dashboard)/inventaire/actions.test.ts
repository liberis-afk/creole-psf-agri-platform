import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Inventaire actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarm(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("inv-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm };
  }

  it("lets a manager create an inventory item", async () => {
    const { user, farm } = await setupFarm("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("name", "Semences de maïs");
    formData.set("category", "SEMENCE");
    formData.set("quantity", "50");
    formData.set("unit", "kg");

    await createInventoryItem(formData);

    const item = await prisma.inventoryItem.findFirstOrThrow({ where: { farmId: farm.id } });
    expect(item).toMatchObject({ name: "Semences de maïs", category: "SEMENCE", quantity: 50, unit: "kg" });
  });

  it("rejects a negative quantity", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("name", "Engrais");
    formData.set("quantity", "-5");
    formData.set("unit", "sacs");

    await expect(createInventoryItem(formData)).rejects.toThrow(/quantité/i);
  });

  it("rejects an employee creating an inventory item", async () => {
    const { user, farm } = await setupFarm("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("name", "Interdit");
    formData.set("quantity", "1");
    formData.set("unit", "kg");

    await expect(createInventoryItem(formData)).rejects.toThrow(/réservée aux administrateurs et managers/i);
  });

  it("updates an item and refuses cross-farm updates", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    const { farm: otherFarm } = await setupFarm("ADMIN");
    // Make `user` an admin of `otherFarm` too, so the mismatch below is
    // caught by the item-ownership check rather than the role check.
    await addMembership(user.id, otherFarm.id, "ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const item = await prisma.inventoryItem.create({
      data: { farmId: farm.id, name: "Avant", category: "AUTRE", quantity: 1, unit: "u" },
    });

    const formData = new FormData();
    formData.set("name", "Après");
    formData.set("category", "ENGRAIS");
    formData.set("quantity", "10");
    formData.set("unit", "L");

    await updateInventoryItem(farm.id, item.id, formData);
    const updated = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } });
    expect(updated).toMatchObject({ name: "Après", category: "ENGRAIS", quantity: 10, unit: "L" });

    await expect(updateInventoryItem(otherFarm.id, item.id, formData)).rejects.toThrow(/introuvable/i);
  });

  it("deletes an item and redirects", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const item = await prisma.inventoryItem.create({
      data: { farmId: farm.id, name: "À supprimer", category: "AUTRE", quantity: 1, unit: "u" },
    });

    await expect(deleteInventoryItem(farm.id, item.id)).rejects.toThrow("NEXT_REDIRECT:/inventaire");
    const found = await prisma.inventoryItem.findUnique({ where: { id: item.id } });
    expect(found).toBeNull();
  });
});
