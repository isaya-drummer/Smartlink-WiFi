import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import AdminShell from "@/components/admin/AdminShell"

export const metadata: Metadata = {
  title: {
    template: "SmartLink Digital — Admin: %s",
    default: "SmartLink Digital — Admin",
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/auth/login")
  }

  return <AdminShell>{children}</AdminShell>
}
