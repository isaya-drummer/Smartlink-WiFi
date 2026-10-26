import { PrismaClient } from "@prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ── Users ────────────────────────────────────────────────────────────────
  const superAdminPassword = await bcryptjs.hash("superadmin123", 12)
  const adminPassword = await bcryptjs.hash("admin123", 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@wifi.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@wifi.local",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  })
  console.log("✅ Super Admin user:", superAdmin.email)

  const admin = await prisma.user.upsert({
    where: { email: "admin@wifi.local" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@wifi.local",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  })
  console.log("✅ Admin user:", admin.email)

  // ── Bundles ───────────────────────────────────────────────────────────────
  const hourlyBundle = await prisma.bundle.upsert({
    where: { id: "bundle-hourly" },
    update: {},
    create: {
      id: "bundle-hourly",
      name: "Hourly",
      description: "1 hour of fast internet access",
      price: 500,
      currency: "TZS",
      durationHours: 1,
      dataLimitMB: 500,
      isActive: true,
    },
  })

  const threeHourBundle = await prisma.bundle.upsert({
    where: { id: "bundle-3hr" },
    update: {},
    create: {
      id: "bundle-3hr",
      name: "Three Hours",
      description: "3 hours of fast internet access",
      price: 1000,
      currency: "TZS",
      durationHours: 3,
      dataLimitMB: 1024,
      isActive: true,
    },
  })

  const dailyBundle = await prisma.bundle.upsert({
    where: { id: "bundle-daily" },
    update: {},
    create: {
      id: "bundle-daily",
      name: "Daily",
      description: "24 hours of fast internet access",
      price: 2000,
      currency: "TZS",
      durationHours: 24,
      dataLimitMB: 3072,
      isActive: true,
    },
  })

  const weeklyBundle = await prisma.bundle.upsert({
    where: { id: "bundle-weekly" },
    update: {},
    create: {
      id: "bundle-weekly",
      name: "Weekly",
      description: "7 days of fast internet access",
      price: 8000,
      currency: "TZS",
      durationHours: 168,
      dataLimitMB: 15360,
      isActive: true,
    },
  })
  console.log("✅ Bundles created: Hourly, Three Hours, Daily, Weekly")

  // ── Sample Vouchers ───────────────────────────────────────────────────────
  const now = new Date()

  const voucher1 = await prisma.voucher.upsert({
    where: { code: "ABCD2345" },
    update: {},
    create: {
      code: "ABCD2345",
      bundleId: hourlyBundle.id,
      clientPhone: "+255712345678",
      clientName: "John Doe",
      paymentProvider: "AIRTEL",
      paymentRef: "PAY-001-AIRTEL",
      amount: 500,
      status: "ACTIVE",
      activatedAt: now,
      expiresAt: new Date(now.getTime() + 1 * 60 * 60 * 1000),
    },
  })

  const voucher2 = await prisma.voucher.upsert({
    where: { code: "EFGH6789" },
    update: {},
    create: {
      code: "EFGH6789",
      bundleId: dailyBundle.id,
      clientPhone: "+255723456789",
      clientName: "Jane Smith",
      paymentProvider: "VODACOM",
      paymentRef: "PAY-002-VODACOM",
      amount: 2000,
      status: "ACTIVE",
      activatedAt: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  })

  const voucher3 = await prisma.voucher.upsert({
    where: { code: "JKMN2378" },
    update: {},
    create: {
      code: "JKMN2378",
      bundleId: weeklyBundle.id,
      clientPhone: "+255734567890",
      clientName: "Ali Hassan",
      paymentProvider: "HALOTEL",
      paymentRef: "PAY-003-HALOTEL",
      amount: 8000,
      status: "ACTIVE",
      activatedAt: now,
      expiresAt: new Date(now.getTime() + 168 * 60 * 60 * 1000),
    },
  })
  console.log("✅ Sample vouchers created: ABCD2345, EFGH6789, JKMN2378")

  // ── Sample Payments ────────────────────────────────────────────────────────
  await prisma.payment.upsert({
    where: { reference: "PAY-001-AIRTEL" },
    update: {},
    create: {
      voucherId: voucher1.id,
      provider: "AIRTEL",
      phoneNumber: "+255712345678",
      amount: 500,
      currency: "TZS",
      reference: "PAY-001-AIRTEL",
      status: "SUCCESS",
    },
  })

  await prisma.payment.upsert({
    where: { reference: "PAY-002-VODACOM" },
    update: {},
    create: {
      voucherId: voucher2.id,
      provider: "VODACOM",
      phoneNumber: "+255723456789",
      amount: 2000,
      currency: "TZS",
      reference: "PAY-002-VODACOM",
      status: "SUCCESS",
    },
  })
  console.log("✅ Sample payments created")

  // ── System Settings ────────────────────────────────────────────────────────
  await prisma.systemSettings.upsert({
    where: { key: "hotspot_name" },
    update: {},
    create: { key: "hotspot_name", value: "SmartLink Digital Hotspot" },
  })

  await prisma.systemSettings.upsert({
    where: { key: "welcome_message" },
    update: {},
    create: {
      key: "welcome_message",
      value: "Welcome to SmartLink Digital — We're here for you, daily",
    },
  })

  await prisma.systemSettings.upsert({
    where: { key: "max_sessions" },
    update: {},
    create: { key: "max_sessions", value: "100" },
  })

  await prisma.systemSettings.upsert({
    where: { key: "session_timeout_hours" },
    update: {},
    create: { key: "session_timeout_hours", value: "24" },
  })
  console.log("✅ System settings seeded")

  console.log("🎉 Database seeding completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
