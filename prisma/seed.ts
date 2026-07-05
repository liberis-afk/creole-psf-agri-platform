import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@creole-psf.test";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const farm = await prisma.farm.upsert({
    where: { id: "seed-farm" },
    update: {},
    create: {
      id: "seed-farm",
      name: "Ferme de démonstration",
      location: "Haïti",
    },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
    },
  });

  await prisma.membership.upsert({
    where: { userId_farmId: { userId: user.id, farmId: farm.id } },
    update: { role: "ADMIN" },
    create: {
      userId: user.id,
      farmId: farm.id,
      role: "ADMIN",
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
