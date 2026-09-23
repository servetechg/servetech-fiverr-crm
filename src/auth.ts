import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";

import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth/login-schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = Number(user.id);
        if (user.role) {
          token.role = user.role;
        }
        token.fullName = user.name ?? "";
      }
      return token;
    },
    session: ({ session, token }): Session => {
      if (
        typeof token.id !== "number" ||
        typeof token.role !== "string" ||
        typeof token.fullName !== "string"
      ) {
        return session;
      }

      return {
        ...session,
        user: {
          email: session.user?.email,
          name: session.user?.name,
          image: session.user?.image,
          id: token.id,
          role: token.role,
          fullName: token.fullName,
        },
      };
    },
  },
  trustHost: true,
});
