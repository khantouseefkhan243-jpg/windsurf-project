import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            patient: true,
            doctor: true,
            staff: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          patient: user.patient,
          doctor: user.doctor,
          staff: user.staff
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.twoFactorEnabled = user.twoFactorEnabled
        token.patient = user.patient
        token.doctor = user.doctor
        token.staff = user.staff
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        session.user.patient = token.patient as any
        session.user.doctor = token.doctor as any
        session.user.staff = token.staff as any
      }
      return session
    }
  },
  pages: {
    signIn: "/[locale]/login",
    error: "/[locale]/login"
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
