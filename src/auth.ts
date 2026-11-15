import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import {
  syncGoogleDonaturUser,
  verifyCredentialsUser,
} from "@/features/auth/services/auth.service";
import { RoleName } from "@/features/auth/types/auth.types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      id: "credentials",
      name: "Username & Password",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await verifyCredentialsUser(
          String(credentials.identifier),
          String(credentials.password),
        );
        if (!user) return null;

        return {
          id: String(user.id_user),
          name: user.name,
          email: user.email,
          id_user: user.id_user,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const synced = await syncGoogleDonaturUser({
          email: user.email,
          name: user.name || "Donatur Google",
          googleId: account.providerAccountId,
        });
        return Boolean(synced);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.users.findUnique({
            where: { email: user.email.toLowerCase() },
            include: { roles: true },
          });
          if (dbUser) {
            token.id_user = dbUser.id_user;
            token.username = dbUser.username;
            token.role = dbUser.roles.nama_role as RoleName;
          }
        } else {
          const customUser = user as unknown as Partial<{
            id_user: number;
            username: string;
            role: RoleName;
          }>;

          if (typeof customUser.id_user === "number") {
            token.id_user = customUser.id_user;
          }
          if (typeof customUser.username === "string") {
            token.username = customUser.username;
          }
          if (customUser.role) {
            token.role = customUser.role;
          }
        }
      }
      return token;
    },
  },
});
