import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction, updateTransaction, deleteTransaction } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("Comptabilité actions", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarm(role: "ADMIN" | "MANAGER" | "EMPLOYEE" = "ADMIN") {
    const user = await createTestUser("tx-" + role.toLowerCase());
    const farm = await createTestFarm();
    await addMembership(user.id, farm.id, role);
    userIds.push(user.id);
    farmIds.push(farm.id);
    return { user, farm };
  }

  it("lets a manager record a transaction", async () => {
    const { user, farm } = await setupFarm("MANAGER");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("type", "REVENU");
    formData.set("amount", "250.5");
    formData.set("description", "Vente de récolte");
    formData.set("date", "2026-06-15");

    await createTransaction(formData);

    const tx = await prisma.transaction.findFirstOrThrow({ where: { farmId: farm.id } });
    expect(tx).toMatchObject({ type: "REVENU", amount: 250.5, description: "Vente de récolte" });
    expect(tx.date.toISOString().slice(0, 10)).toBe("2026-06-15");
  });

  it("rejects a zero or negative amount", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("type", "DEPENSE");
    formData.set("amount", "0");

    await expect(createTransaction(formData)).rejects.toThrow(/montant/i);
  });

  it("rejects an employee recording a transaction", async () => {
    const { user, farm } = await setupFarm("EMPLOYEE");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("farmId", farm.id);
    formData.set("type", "DEPENSE");
    formData.set("amount", "10");

    await expect(createTransaction(formData)).rejects.toThrow(/réservée aux administrateurs et managers/i);
  });

  it("updates a transaction and refuses cross-farm updates", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    const { farm: otherFarm } = await setupFarm("ADMIN");
    await addMembership(user.id, otherFarm.id, "ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const tx = await prisma.transaction.create({
      data: { farmId: farm.id, type: "DEPENSE", amount: 5 },
    });

    const formData = new FormData();
    formData.set("type", "REVENU");
    formData.set("amount", "42");
    formData.set("description", "Corrigé");

    await updateTransaction(farm.id, tx.id, formData);
    const updated = await prisma.transaction.findUniqueOrThrow({ where: { id: tx.id } });
    expect(updated).toMatchObject({ type: "REVENU", amount: 42, description: "Corrigé" });

    await expect(updateTransaction(otherFarm.id, tx.id, formData)).rejects.toThrow(/introuvable/i);
  });

  it("deletes a transaction and redirects", async () => {
    const { user, farm } = await setupFarm("ADMIN");
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const tx = await prisma.transaction.create({
      data: { farmId: farm.id, type: "DEPENSE", amount: 5 },
    });

    await expect(deleteTransaction(farm.id, tx.id)).rejects.toThrow("NEXT_REDIRECT:/comptabilite");
    const found = await prisma.transaction.findUnique({ where: { id: tx.id } });
    expect(found).toBeNull();
  });
});
