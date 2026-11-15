import type { NextAuthConfig } from "next-auth";
import { RoleName } from "@/features/auth/types/auth.types";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // Idle timeout: logout otomatis jika diam 30 menit
    updateAge: 60, // Perpanjang masa berlaku sesi setiap 1 menit jika aktif
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as unknown as Record<string, unknown>;
        sessionUser.id_user = token.id_user;
        sessionUser.username = token.username;
        sessionUser.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
