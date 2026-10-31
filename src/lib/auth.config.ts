import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "smartlink-wifi-hotspot-auth-fallback-secret-key-32chars",
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") {
          token.name = session.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (typeof token.name === "string") {
          session.user.name = token.name
        }
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
} satisfies NextAuthConfig

