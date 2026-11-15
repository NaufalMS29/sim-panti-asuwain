import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { ROLE_DASHBOARD_MAP, RoleName } from "@/features/auth/types/auth.types";
import { canAccessRoute } from "@/lib/rbac";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth?.user);
  const role = (req.auth?.user as { role?: RoleName } | undefined)?.role;

  if (pathname.startsWith("/dashboard")) {
    const allowed = role ? canAccessRoute(role, pathname) : false;
    console.log("[RBAC CHECK]", { pathname, isLoggedIn, role, allowed });

    if (!isLoggedIn || !role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!allowed) {
      const fallbackUrl = ROLE_DASHBOARD_MAP[role] || "/dashboard/donatur";
      return NextResponse.redirect(new URL(fallbackUrl, req.url));
    }
  }

  if (
    (pathname === "/login" || pathname === "/register") &&
    isLoggedIn &&
    role
  ) {
    const target = ROLE_DASHBOARD_MAP[role] || "/dashboard/donatur";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
