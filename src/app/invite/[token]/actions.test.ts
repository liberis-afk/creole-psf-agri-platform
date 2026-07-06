import { randomBytes } from "node:crypto";
import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { acceptInvitation } from "./actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

describe("acceptInvitation", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
  });

  async function setupFarmWithInviter() {
    const inviter = await createTestUser("inviter");
    const farm = await createTestFarm();
    await addMembership(inviter.id, farm.id, "ADMIN");
    userIds.push(inviter.id);
    farmIds.push(farm.id);
    return { inviter, farm };
  }

  async function createInvitationRow(opts: {
    farmId: string;
    invitedById: string;
    email: string;
    role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
    status?: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
    expiresAt?: Date;
  }) {
    return prisma.invitation.create({
      data: {
        email: opts.email,
        role: opts.role ?? "EMPLOYEE",
        farmId: opts.farmId,
        invitedById: opts.invitedById,
        token: randomBytes(32).toString("hex"),
        status: opts.status ?? "PENDING",
        expiresAt: opts.expiresAt ?? new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    });
  }

  it("creates a new user and membership for a first-time invitee", async () => {
    const { inviter, farm } = await setupFarmWithInviter();
    const invitation = await createInvitationRow({
      farmId: farm.id,
      invitedById: inviter.id,
      email: "brandnew@test.local",
      role: "MANAGER",
    });

    const formData = new FormData();
    formData.set("password", "newpassword123");
    formData.set("name", "Brand New");

    const result = await acceptInvitation(invitation.token, undefined, formData);
    expect(result).toBeUndefined();

    const user = await prisma.user.findUniqueOrThrow({ where: { email: "brandnew@test.local" } });
    userIds.push(user.id);

    const membership = await prisma.membership.findUnique({
      where: { userId_farmId: { userId: user.id, farmId: farm.id } },
    });
    expect(membership).toMatchObject({ role: "MANAGER" });

    const updatedInvitation = await prisma.invitation.findUniqueOrThrow({
      where: { id: invitation.id },
    });
    expect(updatedInvitation.status).toBe("ACCEPTED");
  });

  it("attaches an existing user's account when the password matches", async () => {
    const { inviter, farm } = await setupFarmWithInviter();
    const existingUser = await createTestUser("existing");
    userIds.push(existingUser.id);

    const invitation = await createInvitationRow({
      farmId: farm.id,
      invitedById: inviter.id,
      email: existingUser.email,
    });

    const formData = new FormData();
    formData.set("password", "testpass123");

    const result = await acceptInvitation(invitation.token, undefined, formData);
    expect(result).toBeUndefined();

    const membership = await prisma.membership.findUnique({
      where: { userId_farmId: { userId: existingUser.id, farmId: farm.id } },
    });
    expect(membership).not.toBeNull();
  });

  it("rejects an existing user with the wrong password", async () => {
    const { inviter, farm } = await setupFarmWithInviter();
    const existingUser = await createTestUser("existing2");
    userIds.push(existingUser.id);

    const invitation = await createInvitationRow({
      farmId: farm.id,
      invitedById: inviter.id,
      email: existingUser.email,
    });

    const formData = new FormData();
    formData.set("password", "wrongpassword");

    const result = await acceptInvitation(invitation.token, undefined, formData);
    expect(result).toMatch(/mot de passe incorrect/i);

    const membership = await prisma.membership.findUnique({
      where: { userId_farmId: { userId: existingUser.id, farmId: farm.id } },
    });
    expect(membership).toBeNull();
  });

  it("rejects an expired invitation", async () => {
    const { inviter, farm } = await setupFarmWithInviter();
    const invitation = await createInvitationRow({
      farmId: farm.id,
      invitedById: inviter.id,
      email: "expired@test.local",
      expiresAt: new Date(Date.now() - 1000),
    });

    const formData = new FormData();
    formData.set("password", "newpassword123");

    const result = await acceptInvitation(invitation.token, undefined, formData);
    expect(result).toMatch(/invalide ou expirée/i);

    const user = await prisma.user.findUnique({ where: { email: "expired@test.local" } });
    expect(user).toBeNull();
  });

  it("rejects an already-accepted invitation", async () => {
    const { inviter, farm } = await setupFarmWithInviter();
    const invitation = await createInvitationRow({
      farmId: farm.id,
      invitedById: inviter.id,
      email: "already@test.local",
      status: "ACCEPTED",
    });

    const formData = new FormData();
    formData.set("password", "newpassword123");

    const result = await acceptInvitation(invitation.token, undefined, formData);
    expect(result).toMatch(/invalide ou expirée/i);
  });
});
