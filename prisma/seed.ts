import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: {
      email: "alice@example.com",
    },
    update: {},
    create: {
      name: "Alice",
      email: "alice@example.com",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "bob@example.com",
    },
    update: {},
    create: {
      name: "Bob",
      email: "bob@example.com",
      passwordHash,
    },
  });

  console.log("Demo users seeded successfully.");
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
