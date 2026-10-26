# SmartLink Digital — WiFi Hotspot Management System

SmartLink Digital is a Next.js-based WiFi hotspot billing and captive-portal
system. When a client connects to the WiFi, they are redirected to a browser
portal where they pick a mobile-money provider, choose a data bundle, pay, and
receive a time-limited access voucher. Admins and Super Admins get a full
management console to control bundles, vouchers, clients, payments, and system
settings.

## Features

- Captive-style portal flow: provider → bundle → payment → voucher
- Four mobile-money providers: **YAS**, **Airtel**, **Vodacom**, **Halotel**
- Bundles with price, duration, and data limit
- Voucher generation with activation and expiry tracking
- Payment records and webhook-style activation endpoint
- Admin dashboard: bundles, vouchers, clients, payments, settings
- Super Admin dashboard: admins, audit log, system/DB info, settings
- NextAuth credentials authentication with role-based access (SUPER_ADMIN, ADMIN)

## Tech Stack

- Next.js 14 (App Router) + React 18
- TypeScript
- Tailwind CSS + Radix UI primitives
- Prisma ORM + SQLite (`dev.db`)
- NextAuth v5 (credentials provider, `@auth/prisma-adapter`)
- bcryptjs for password hashing
- Recharts for dashboard charts
- Zod for validation

## Install & Run

Prerequisites: Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create the database and apply the schema
npx prisma db push

# 3. Seed default users, bundles, sample vouchers, and settings (via ts-node)
npx prisma db seed

# 4. Start the dev server
npm run dev
```

Then open <http://localhost:3000>.

`.env` is required. Copy `.env.example` to `.env` and fill in the values:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="smartlink-digital-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

> The seed script runs through ts-node, which is already configured in
> `package.json` (`prisma.seed`). `npx prisma db seed` invokes it automatically.

## Default Credentials

| Role         | Email                  | Password        |
| ------------ | ---------------------- | --------------- |
| Super Admin  | superadmin@wifi.local  | superadmin123   |
| Admin        | admin@wifi.local       | admin123         |

Change these after first login in a real deployment.

## Portal Flow Walkthrough

A client connects to the WiFi and is redirected to the portal in their browser:

1. Visit <http://localhost:3000/portal> — "Connect to WiFi" landing.
2. **Select a provider** — tap YAS, Airtel, Vodacom, or Halotel.
3. **Select a bundle** — choose an active bundle (e.g. Hourly, Daily, Weekly).
4. **Pay** — enter the mobile-money amount and phone number, then confirm.
5. **Get your voucher** — the system activates the voucher and shows a unique
   access code with an expiry time. The client enters that code on the hotspot
   login page to connect to the internet for the bundle's duration.

Seeded sample vouchers for testing: `ABCD2345`, `EFGH6789`, `JKMN2378`.

## Key URLs

| URL                         | Description                              | Access         |
| --------------------------- | ---------------------------------------- | -------------- |
| `/portal`                   | Client WiFi portal (provider selection)  | Public         |
| `/portal/bundle`            | Bundle selection (after provider)        | Public         |
| `/portal/pay`               | Payment form                             | Public         |
| `/portal/success`            | Voucher activation & display             | Public         |
| `/auth/login`               | Admin / Super Admin login                | Public         |
| `/admin`                    | Admin dashboard                          | ADMIN          |
| `/admin/bundles`             | Manage bundles                           | ADMIN          |
| `/admin/vouchers`            | Manage vouchers                          | ADMIN          |
| `/admin/clients`             | View clients                             | ADMIN          |
| `/admin/payments`            | View payments                            | ADMIN          |
| `/admin/settings`            | Admin settings                           | ADMIN          |
| `/super-admin`               | Super Admin dashboard                    | SUPER_ADMIN    |
| `/super-admin/admins`        | Manage admin accounts                    | SUPER_ADMIN    |
| `/super-admin/audit`         | Audit log                                | SUPER_ADMIN    |
| `/super-admin/system`        | System / database info                   | SUPER_ADMIN    |

## Notes

- The database is SQLite stored at `prisma/dev.db` (`DATABASE_URL="file:./dev.db"`).
- Reset the database with `npx prisma db push --force-reset` then re-seed.
- The SmartLink Digital logo lives at `public/smartlink-logo.jpeg`.
