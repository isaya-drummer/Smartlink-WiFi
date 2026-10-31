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
  let session = null
  let role: string | undefined = undefined

  try {
    session = await auth()
    role = (session?.user as { role?: string } | undefined)?.role
  } catch (error) {
    if (typeof error === "object" && error !== null && "digest" in error && typeof (error as { digest: string }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Auth error in AdminLayout:", error)
  }

  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/auth/login")
  }

  return <AdminShell>{children}</AdminShell>
}
