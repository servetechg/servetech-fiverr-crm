import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@servetech.global" },
    update: {},
    create: {
      fullName: "Admin",
      email: "admin@servetech.global",
      passwordHash,
      role: UserRole.Admin,
      monthlyTarget: 10000,
    },
  });

  const salesperson = await prisma.user.upsert({
    where: { email: "sales@servetech.global" },
    update: {},
    create: {
      fullName: "Bilal Ahmed",
      email: "sales@servetech.global",
      passwordHash,
      role: UserRole.Salesperson,
      monthlyTarget: 5000,
    },
  });

  const accounts = ["Sabrina", "servetech02", "Dora Moore"];
  for (const accountName of accounts) {
    await prisma.fiverrAccount.upsert({
      where: { accountName },
      update: {},
      create: { accountName, isActive: true },
    });
  }

  const services = [
    { serviceName: "WordPress", category: "Web Development", defaultBasePrice: 499 },
    { serviceName: "Website Redesign", category: "Web Development", defaultBasePrice: 799 },
    { serviceName: "Landing Page", category: "Web Development", defaultBasePrice: 399 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { serviceName: service.serviceName },
      update: {},
      create: service,
    });
  }

  console.info("Seed complete:", { admin: admin.email, salesperson: salesperson.email });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
