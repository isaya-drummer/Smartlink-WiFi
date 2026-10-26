import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
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

  redirect("/portal")
}
