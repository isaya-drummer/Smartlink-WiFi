import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Sidebar from "@/components/admin/Sidebar"

export const metadata: Metadata = {
  title: {
    template: "SmartLink Digital — Admin: %s",
    default: "SmartLink Digital — Admin",
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0d1f3c" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#0d1f3c" }}>
        {children}
      </main>
    </div>
  )
}
