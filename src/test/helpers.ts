import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export async function createTestUser(label = "user") {
  const email = `${label}-${randomUUID()}@test.local`;
  const password = await bcrypt.hash("testpass123", 4);
  return prisma.user.create({ data: { email, password, name: label } });
}

export async function createTestFarm(label = "Test Farm") {
  return prisma.farm.create({ data: { name: `${label} ${randomUUID()}` } });
}

export async function addMembership(userId: string, farmId: string, role: Role) {
  return prisma.membership.create({ data: { userId, farmId, role } });
}

/** Deletes the farm (cascades to memberships/parcels/crops/tasks) and the given users. */
export async function cleanup(farmIds: string[], userIds: string[] = []) {
  await prisma.farm.deleteMany({ where: { id: { in: farmIds } } });
  if (userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}
