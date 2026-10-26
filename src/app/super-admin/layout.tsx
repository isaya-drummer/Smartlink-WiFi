import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar"

export const metadata: Metadata = {
  title: {
    template: "SmartLink Digital — Super Admin: %s",
    default: "SmartLink Digital — Super Admin",
  },
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "SUPER_ADMIN") {
    redirect("/auth/login")
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "#0d1f3c" }}
    >
      <SuperAdminSidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "#0d1f3c" }}
      >
        {children}
      </main>
    </div>
  )
}
