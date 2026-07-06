import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSaison } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("createSaison", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarm(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("saison-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm };
  }

  it("lets a manager create a saison", async () => {
    const { user, farm } = await setupFarm("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("nom", "Saison sèche");
    formData.set("annee", "2026");

    await createSaison(formData);

    const saison = await prisma.saison.findFirstOrThrow({ where: { farmId: farm.id } });
    expect(saison).toMatchObject({ nom: "Saison sèche", annee: 2026, statut: "EN_COURS" });
  });

  it("rejects an employee creating a saison", async () => {
    const { user, farm } = await setupFarm("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("nom", "Interdite");
    formData.set("annee", "2026");

    await expect(createSaison(formData)).rejects.toThrow(
      /réservée aux administrateurs et managers/i,
    );
  });

  it("automatically closes the previous active saison when creating a new one", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const firstFormData = new FormData();
    firstFormData.set("farmId", farm.id);
    firstFormData.set("nom", "Première");
    firstFormData.set("annee", "2025");
    await createSaison(firstFormData);

    const first = await prisma.saison.findFirstOrThrow({ where: { farmId: farm.id, nom: "Première" } });

    const secondFormData = new FormData();
    secondFormData.set("farmId", farm.id);
    secondFormData.set("nom", "Deuxième");
    secondFormData.set("annee", "2026");
    await createSaison(secondFormData);

    const updatedFirst = await prisma.saison.findUniqueOrThrow({ where: { id: first.id } });
    expect(updatedFirst.statut).toBe("TERMINEE");
    expect(updatedFirst.dateFin).not.toBeNull();

    const second = await prisma.saison.findFirstOrThrow({ where: { farmId: farm.id, nom: "Deuxième" } });
    expect(second.statut).toBe("EN_COURS");

    const activeCount = await prisma.saison.count({ where: { farmId: farm.id, statut: "EN_COURS" } });
    expect(activeCount).toBe(1);
  });
});
