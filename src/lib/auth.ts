import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials")
          return null
        }

        console.log("[Auth] Looking up user:", credentials.email)

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
        } catch (err) {
          console.error("[Auth] DB error looking up user:", err)
          return null
        }

        if (!user) {
          console.log("[Auth] User not found:", credentials.email)
          return null
        }

        if (!user.isActive) {
          console.log("[Auth] User inactive:", credentials.email)
          return null
        }

        console.log("[Auth] User found, checking password. Hash starts with:", user.password.slice(0, 10))

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        )

        console.log("[Auth] Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
        }
      },
    }),
  ],
})
