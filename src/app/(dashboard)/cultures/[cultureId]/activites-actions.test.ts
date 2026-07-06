import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createActivite } from "./activites-actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("createActivite", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithCulture(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("activite-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    const parcelle = await prisma.parcelle.create({ data: { farmId: farm.id, name: "Parcelle" } });
    const culture = await prisma.culture.create({
      data: { parcelleId: parcelle.id, nomCulture: "Maïs" },
    });
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm, culture };
  }

  it("lets a manager log an irrigation activity with quantite/unite", async () => {
    const { user, farm, culture } = await setupFarmWithCulture("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("type", "IRRIGATION");
    formData.set("date", "2026-06-10");
    formData.set("quantite", "500");
    formData.set("unite", "litres");

    await createActivite(farm.id, culture.id, formData);

    const activite = await prisma.activite.findFirstOrThrow({ where: { cultureId: culture.id } });
    expect(activite).toMatchObject({
      type: "IRRIGATION",
      quantite: 500,
      unite: "litres",
      createdById: user.id,
    });
  });

  it("rejects an employee logging an activity", async () => {
    const { user, farm, culture } = await setupFarmWithCulture("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("type", "PLANTATION");
    formData.set("date", "2026-06-01");

    await expect(createActivite(farm.id, culture.id, formData)).rejects.toThrow(
      /réservée aux administrateurs et managers/i,
    );
  });

  it("rejects logging an activity when the culture id belongs to a different farm", async () => {
    const { user, farm } = await setupFarmWithCulture("ADMIN");
    const { culture: otherCulture } = await setupFarmWithCulture("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("type", "PLANTATION");
    formData.set("date", "2026-06-01");

    await expect(createActivite(farm.id, otherCulture.id, formData)).rejects.toThrow(
      /introuvable/i,
    );
  });
});
