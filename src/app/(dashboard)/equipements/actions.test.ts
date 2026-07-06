import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEquipement, updateEquipement, deleteEquipement } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Equipements actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarm(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("equip-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm };
  }

  it("lets a manager create an equipement", async () => {
    const { user, farm } = await setupFarm("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("identifiant", "TRAC-001");
    formData.set("nom", "Tracteur John Deere");
    formData.set("type", "Tracteur");

    await createEquipement(formData);

    const equipement = await prisma.equipement.findFirstOrThrow({ where: { farmId: farm.id } });
    expect(equipement).toMatchObject({
      identifiant: "TRAC-001",
      nom: "Tracteur John Deere",
      statut: "OPERATIONNEL",
    });
  });

  it("rejects an employee creating an equipement", async () => {
    const { user, farm } = await setupFarm("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("identifiant", "TRAC-002");
    formData.set("nom", "Interdit");

    await expect(createEquipement(formData)).rejects.toThrow(
      /réservée aux administrateurs et managers/i,
    );
  });

  it("rejects a duplicate identifiant on the same farm", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("identifiant", "TRAC-003");
    formData.set("nom", "Premier");
    await createEquipement(formData);

    const secondFormData = new FormData();
    secondFormData.set("farmId", farm.id);
    secondFormData.set("identifiant", "TRAC-003");
    secondFormData.set("nom", "Deuxième");

    await expect(createEquipement(secondFormData)).rejects.toThrow(/existe déjà/i);
  });

  it("allows the same identifiant on a different farm", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    const { farm: otherFarm } = await setupFarm("ADMIN");
    await addMembership(user.id, otherFarm.id, "ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("identifiant", "TRAC-004");
    formData.set("nom", "Ferme 1");
    await createEquipement(formData);

    const otherFormData = new FormData();
    otherFormData.set("farmId", otherFarm.id);
    otherFormData.set("identifiant", "TRAC-004");
    otherFormData.set("nom", "Ferme 2");

    await expect(createEquipement(otherFormData)).resolves.not.toThrow();
  });

  it("updates and deletes an equipement", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const equipement = await prisma.equipement.create({
      data: { farmId: farm.id, identifiant: "TRAC-005", nom: "Avant" },
    });

    const updateFormData = new FormData();
    updateFormData.set("nom", "Après");
    updateFormData.set("statut", "EN_PANNE");

    await updateEquipement(farm.id, equipement.id, updateFormData);

    const updated = await prisma.equipement.findUniqueOrThrow({ where: { id: equipement.id } });
    expect(updated).toMatchObject({ nom: "Après", statut: "EN_PANNE" });

    await expect(deleteEquipement(farm.id, equipement.id)).rejects.toThrow(
      "NEXT_REDIRECT:/equipements",
    );
    const found = await prisma.equipement.findUnique({ where: { id: equipement.id } });
    expect(found).toBeNull();
  });
});
