import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  try {
    const session = await auth()

    if (!session?.user) {
      redirect("/portal")
    }

    const role = (session.user as { role?: string }).role

    if (role === "SUPER_ADMIN") {
      redirect("/super-admin")
    }

    if (role === "ADMIN") {
      redirect("/admin")
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && "digest" in error && typeof (error as { digest: string }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
  }

  redirect("/portal")
}
