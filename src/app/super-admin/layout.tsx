import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import SuperAdminShell from "@/components/super-admin/SuperAdminShell"

export const metadata: Metadata = {
  title: {
    template: "SmartLink Digital — Super Admin: %s",
    default: "SmartLink Digital — Super Admin",
  },
}

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "SUPER_ADMIN") {
    redirect("/auth/login")
  }

  return <SuperAdminShell>{children}</SuperAdminShell>
}
