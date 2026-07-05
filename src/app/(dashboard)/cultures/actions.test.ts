import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCrop, updateCrop, deleteCrop } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Cultures actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithParcel(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("crop-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    const parcel = await prisma.parcel.create({ data: { farmId: farm.id, name: "Parcelle" } });
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm, parcel };
  }

  it("lets a manager create a crop on their parcel", async () => {
    const { user, parcel } = await setupFarmWithParcel("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("parcelId", parcel.id);
    formData.set("name", "Maïs");
    formData.set("stage", "PLANTEE");
    formData.set("plantedAt", "2026-06-01");
    formData.set("expectedYield", "1200");

    await createCrop(formData);

    const crop = await prisma.crop.findFirstOrThrow({ where: { parcelId: parcel.id } });
    expect(crop).toMatchObject({ name: "Maïs", stage: "PLANTEE", expectedYield: 1200 });
    expect(crop.plantedAt?.toISOString().slice(0, 10)).toBe("2026-06-01");
  });

  it("rejects an employee creating a crop", async () => {
    const { user, parcel } = await setupFarmWithParcel("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("parcelId", parcel.id);
    formData.set("name", "Interdit");

    await expect(createCrop(formData)).rejects.toThrow(/réservée aux administrateurs et managers/i);
  });

  it("updates and deletes a crop", async () => {
    const { user, farm, parcel } = await setupFarmWithParcel("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const crop = await prisma.crop.create({ data: { parcelId: parcel.id, name: "Avant" } });

    const updateFormData = new FormData();
    updateFormData.set("name", "Après");
    updateFormData.set("stage", "RECOLTEE");
    updateFormData.set("actualYield", "900");

    await updateCrop(farm.id, crop.id, updateFormData);

    const updated = await prisma.crop.findUniqueOrThrow({ where: { id: crop.id } });
    expect(updated).toMatchObject({ name: "Après", stage: "RECOLTEE", actualYield: 900 });

    await expect(deleteCrop(farm.id, crop.id)).rejects.toThrow("NEXT_REDIRECT:/cultures");
    const found = await prisma.crop.findUnique({ where: { id: crop.id } });
    expect(found).toBeNull();
  });
});
