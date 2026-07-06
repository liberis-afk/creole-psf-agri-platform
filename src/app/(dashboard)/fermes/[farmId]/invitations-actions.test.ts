import { describe, it, expect, vi, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createInvitation, revokeInvitation } from "./invitations-actions";
import { createTestUser, createTestFarm, addMembership, cleanup } from "@/test/helpers";

const mockedAuth = vi.mocked(auth);
const mockedSend = vi.mocked(sendMail);

describe("farm invitations", () => {
  const farmIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    await cleanup(farmIds.splice(0), userIds.splice(0));
    mockedSend.mockClear();
  });

  async function setupFarmWithAdmin() {
    const admin = await createTestUser("admin");
    const farm = await createTestFarm();
    await addMembership(admin.id, farm.id, "ADMIN");
    userIds.push(admin.id);
    farmIds.push(farm.id);
    return { admin, farm };
  }

  it("lets an admin invite a new email and sends an email", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("email", "newperson@test.local");
    formData.set("role", "MANAGER");

    await createInvitation(farm.id, formData);

    const invitation = await prisma.invitation.findFirst({
      where: { farmId: farm.id, email: "newperson@test.local" },
    });
    expect(invitation).toMatchObject({ role: "MANAGER", status: "PENDING" });
    expect(invitation?.token).toHaveLength(64);
    expect(mockedSend).toHaveBeenCalledOnce();
  });

  it("surfaces a mail-send error and does not create an invitation row", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);
    mockedSend.mockResolvedValueOnce({
      error: { message: "You can only send testing emails to your own email address" },
    } as never);

    const formData = new FormData();
    formData.set("email", "blocked@test.local");

    await expect(createInvitation(farm.id, formData)).rejects.toThrow(
      /échec de l'envoi.*own email address/i,
    );

    const invitation = await prisma.invitation.findFirst({
      where: { farmId: farm.id, email: "blocked@test.local" },
    });
    expect(invitation).toBeNull();
  });

  it("rejects a non-admin trying to invite", async () => {
    const { farm } = await setupFarmWithAdmin();
    const employee = await createTestUser("employee");
    await addMembership(employee.id, farm.id, "EMPLOYEE");
    userIds.push(employee.id);

    mockedAuth.mockResolvedValue({ user: { id: employee.id } } as never);

    const formData = new FormData();
    formData.set("email", "whoever@test.local");

    await expect(createInvitation(farm.id, formData)).rejects.toThrow(
      /réservée aux administrateurs/i,
    );
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects inviting an email that is already a member", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    const existingMember = await createTestUser("existing");
    await addMembership(existingMember.id, farm.id, "EMPLOYEE");
    userIds.push(existingMember.id);

    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("email", existingMember.email);

    await expect(createInvitation(farm.id, formData)).rejects.toThrow(/déjà membre/i);
  });

  it("rejects a duplicate pending invitation for the same email", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("email", "duplicate@test.local");

    await createInvitation(farm.id, formData);
    await expect(createInvitation(farm.id, formData)).rejects.toThrow(/déjà en attente/i);
  });

  it("lets an admin revoke a pending invitation", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("email", "torevoke@test.local");
    await createInvitation(farm.id, formData);

    const invitation = await prisma.invitation.findFirstOrThrow({
      where: { farmId: farm.id, email: "torevoke@test.local" },
    });

    await revokeInvitation(farm.id, invitation.id);

    const updated = await prisma.invitation.findUniqueOrThrow({ where: { id: invitation.id } });
    expect(updated.status).toBe("REVOKED");
  });

  it("allows re-inviting the same email after the prior invitation was revoked", async () => {
    const { admin, farm } = await setupFarmWithAdmin();
    mockedAuth.mockResolvedValue({ user: { id: admin.id } } as never);

    const formData = new FormData();
    formData.set("email", "again@test.local");
    await createInvitation(farm.id, formData);

    const invitation = await prisma.invitation.findFirstOrThrow({
      where: { farmId: farm.id, email: "again@test.local" },
    });
    await revokeInvitation(farm.id, invitation.id);

    await expect(createInvitation(farm.id, formData)).resolves.not.toThrow();
  });
});
