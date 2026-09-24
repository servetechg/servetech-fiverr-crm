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

  const accounts: {
    accountName: string;
    accountOwner?: string;
    assignedTeam?: string;
  }[] = [
    { accountName: "Sabrina", accountOwner: "ServeTech Global", assignedTeam: "Team 2" },
    { accountName: "servetech02", accountOwner: "ServeTech Global", assignedTeam: "Team 5" },
    { accountName: "Dora Moore", accountOwner: "Fahad", assignedTeam: "Morning" },
  ];
  for (const account of accounts) {
    await prisma.fiverrAccount.upsert({
      where: { accountName: account.accountName },
      update: {
        accountOwner: account.accountOwner,
        assignedTeam: account.assignedTeam,
      },
      create: {
        accountName: account.accountName,
        accountOwner: account.accountOwner,
        assignedTeam: account.assignedTeam,
        isActive: true,
      },
    });
  }

  const serviceNames = [
    "WordPress",
    "Elementor",
    "Shopify",
    "Custom Website",
    "Website Redesign",
    "Figma to WordPress",
    "Landing Page",
    "UX/UI",
    "Website Maintenance",
    "SEO",
    "Website Speed Optimization",
    "Hosting",
  ];

  for (const serviceName of serviceNames) {
    await prisma.service.upsert({
      where: { serviceName },
      update: { isActive: true },
      create: {
        serviceName,
        category: "Web Development",
        defaultBasePrice: 0,
        isActive: true,
      },
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
