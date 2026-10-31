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
  let session = null
  let role: string | undefined = undefined

  try {
    session = await auth()
    role = (session?.user as { role?: string } | undefined)?.role
  } catch (error) {
    if (typeof error === "object" && error !== null && "digest" in error && typeof (error as { digest: string }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Auth error in SuperAdminLayout:", error)
  }

  if (!session || role !== "SUPER_ADMIN") {
    redirect("/auth/login")
  }

  return <SuperAdminShell>{children}</SuperAdminShell>
}
