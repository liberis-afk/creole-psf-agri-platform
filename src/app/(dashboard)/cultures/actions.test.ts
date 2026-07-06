import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCulture, updateCulture, terminerCulture, deleteCulture } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Cultures actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithParcelle(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("culture-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    const parcelle = await prisma.parcelle.create({ data: { farmId: farm.id, name: "Parcelle" } });
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm, parcelle };
  }

  it("lets a manager create a culture on their parcelle", async () => {
    const { user, parcelle } = await setupFarmWithParcelle("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("parcelleId", parcelle.id);
    formData.set("nomCulture", "Maïs");
    formData.set("variete", "Local");
    formData.set("dateDebut", "2026-06-01");

    await createCulture(formData);

    const culture = await prisma.culture.findFirstOrThrow({ where: { parcelleId: parcelle.id } });
    expect(culture).toMatchObject({ nomCulture: "Maïs", variete: "Local", statut: "EN_COURS" });
    expect(culture.dateDebut?.toISOString().slice(0, 10)).toBe("2026-06-01");
  });

  it("rejects an employee creating a culture", async () => {
    const { user, parcelle } = await setupFarmWithParcelle("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("parcelleId", parcelle.id);
    formData.set("nomCulture", "Interdit");

    await expect(createCulture(formData)).rejects.toThrow(
      /réservée aux administrateurs et managers/i,
    );
  });

  it("rejects a second EN_COURS culture on the same parcelle", async () => {
    const { user, parcelle } = await setupFarmWithParcelle("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    await prisma.culture.create({ data: { parcelleId: parcelle.id, nomCulture: "Première" } });

    const formData = new FormData();
    formData.set("parcelleId", parcelle.id);
    formData.set("nomCulture", "Deuxième");

    await expect(createCulture(formData)).rejects.toThrow(/déjà une culture en cours/i);
  });

  it("allows a new culture once the previous one is terminée", async () => {
    const { user, farm, parcelle } = await setupFarmWithParcelle("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const first = await prisma.culture.create({
      data: { parcelleId: parcelle.id, nomCulture: "Première" },
    });
    await terminerCulture(farm.id, first.id);

    const formData = new FormData();
    formData.set("parcelleId", parcelle.id);
    formData.set("nomCulture", "Deuxième");

    await expect(createCulture(formData)).resolves.not.toThrow();

    const updatedFirst = await prisma.culture.findUniqueOrThrow({ where: { id: first.id } });
    expect(updatedFirst.statut).toBe("TERMINEE");
    expect(updatedFirst.dateFin).not.toBeNull();
  });

  it("updates and deletes a culture", async () => {
    const { user, farm, parcelle } = await setupFarmWithParcelle("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const culture = await prisma.culture.create({
      data: { parcelleId: parcelle.id, nomCulture: "Avant" },
    });

    const updateFormData = new FormData();
    updateFormData.set("nomCulture", "Après");
    updateFormData.set("statut", "TERMINEE");

    await updateCulture(farm.id, culture.id, updateFormData);

    const updated = await prisma.culture.findUniqueOrThrow({ where: { id: culture.id } });
    expect(updated).toMatchObject({ nomCulture: "Après", statut: "TERMINEE" });

    await expect(deleteCulture(farm.id, culture.id)).rejects.toThrow("NEXT_REDIRECT:/cultures");
    const found = await prisma.culture.findUnique({ where: { id: culture.id } });
    expect(found).toBeNull();
  });
});
