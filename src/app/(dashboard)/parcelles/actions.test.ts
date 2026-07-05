import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createParcel, updateParcel, deleteParcel } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Parcelles actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarm(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("parcel-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm };
  }

  it("lets a manager create a parcel", async () => {
    const { user, farm } = await setupFarm("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("name", "Parcelle Test");
    formData.set("soilType", "ARGILEUX");
    formData.set("area", "1.5");
    formData.set("latitude", "19.1");
    formData.set("longitude", "-72.2");

    await createParcel(formData);

    const parcel = await prisma.parcel.findFirstOrThrow({ where: { farmId: farm.id } });
    expect(parcel).toMatchObject({
      name: "Parcelle Test",
      soilType: "ARGILEUX",
      area: 1.5,
      latitude: 19.1,
      longitude: -72.2,
    });
  });

  it("rejects an employee creating a parcel", async () => {
    const { user, farm } = await setupFarm("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("name", "Parcelle Interdite");

    await expect(createParcel(formData)).rejects.toThrow(/réservée aux administrateurs et managers/i);
  });

  it("updates a parcel's fields", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const parcel = await prisma.parcel.create({ data: { farmId: farm.id, name: "Avant" } });

    const formData = new FormData();
    formData.set("name", "Après");
    formData.set("soilType", "SABLEUX");
    formData.set("area", "2");

    await updateParcel(farm.id, parcel.id, formData);

    const updated = await prisma.parcel.findUniqueOrThrow({ where: { id: parcel.id } });
    expect(updated).toMatchObject({ name: "Après", soilType: "SABLEUX", area: 2 });
  });

  it("refuses to update a parcel belonging to a different farm", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    const { farm: otherFarm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const otherParcel = await prisma.parcel.create({ data: { farmId: otherFarm.id, name: "Autre" } });

    const formData = new FormData();
    formData.set("name", "Piraté");

    await expect(updateParcel(farm.id, otherParcel.id, formData)).rejects.toThrow(/introuvable/i);
  });

  it("deletes a parcel and redirects", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const parcel = await prisma.parcel.create({ data: { farmId: farm.id, name: "À supprimer" } });

    await expect(deleteParcel(farm.id, parcel.id)).rejects.toThrow("NEXT_REDIRECT:/parcelles");

    const found = await prisma.parcel.findUnique({ where: { id: parcel.id } });
    expect(found).toBeNull();
  });
});
