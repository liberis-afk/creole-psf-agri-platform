import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createFarm } from "./actions";
import { createTestUser, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("createFarm", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  it("creates a farm and makes the caller its admin", async () => {
    const user = await createTestUser("createfarm");
    userIds.push(user.id);
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("name", "Ma Nouvelle Ferme");
    formData.set("location", "Cap-Haïtien");

    await createFarm(formData);

    const farm = await prisma.farm.findFirst({
      where: { name: "Ma Nouvelle Ferme" },
      include: { memberships: true },
    });
    expect(farm).not.toBeNull();
    farmIds.push(farm!.id);

    expect(farm!.location).toBe("Cap-Haïtien");
    expect(farm!.memberships).toHaveLength(1);
    expect(farm!.memberships[0]).toMatchObject({ userId: user.id, role: "ADMIN" });
  });

  it("rejects an empty name", async () => {
    const user = await createTestUser("createfarm-empty");
    userIds.push(user.id);
    mockedAuth.mockResolvedValue({ user: { id: user.id } } as never);

    const formData = new FormData();
    formData.set("name", "   ");

    await expect(createFarm(formData)).rejects.toThrow(/nom de la ferme/i);
  });

  it("rejects unauthenticated calls", async () => {
    mockedAuth.mockResolvedValue(null as never);

    const formData = new FormData();
    formData.set("name", "Ferme Sans Session");

    await expect(createFarm(formData)).rejects.toThrow(/authentifié/i);
  });
});
