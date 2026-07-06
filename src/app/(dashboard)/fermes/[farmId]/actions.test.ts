import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeMember, updateMemberRole } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);

describe("farm member management", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithAdmin() {
    const admin = await createTestUser("admin");
    const farm = await createTestFarm();
    await addMembership(admin.id, farm.id, "ADMIN");
    userIds.push(admin.id);
    farmIds.push(farm.id);
    return { admin, farm };
  }

  it("blocks demoting the farm's last admin", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    const adminMembership = await prisma.membership.findUniqueOrThrow({
      where: { userId_farmId: { userId: admin.id, farmId: farm.id } },
    });

    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("role", "MANAGER");

    await expect(updateMemberRole(farm.id, adminMembership.id, formData)).rejects.toThrow(
      /au moins un administrateur/i,
    );
  });

  it("blocks removing the farm's last admin", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    const adminMembership = await prisma.membership.findUniqueOrThrow({
      where: { userId_farmId: { userId: admin.id, farmId: farm.id } },
    });

    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    await expect(removeMember(farm.id, adminMembership.id)).rejects.toThrow(
      /au moins un administrateur/i,
    );
  });

  it("allows demoting an admin when another admin remains", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    const secondAdmin = await createTestUser("second-admin");
    await addMembership(secondAdmin.id, farm.id, "ADMIN");
    userIds.push(secondAdmin.id);

    const secondMembership = await prisma.membership.findUniqueOrThrow({
      where: { userId_farmId: { userId: secondAdmin.id, farmId: farm.id } },
    });

    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("role", "EMPLOYEE");

    await updateMemberRole(farm.id, secondMembership.id, formData);

    const updated = await prisma.membership.findUniqueOrThrow({ where: { id: secondMembership.id } });
    expect(updated.role).toBe("EMPLOYEE");
  });
});
