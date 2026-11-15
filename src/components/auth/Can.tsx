"use client";

import { ReactNode } from "react";
import { can, Permission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";

interface CanProps {
  role: RoleName;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ role, permission, children, fallback = null }: CanProps) {
  if (!can(role, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
