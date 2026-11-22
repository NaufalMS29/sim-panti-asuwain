import React from "react";

export type BadgeVariant =
  | "purple"
  | "blue"
  | "amber"
  | "emerald"
  | "red"
  | "slate";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export function Badge({
  variant = "slate",
  icon,
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BADGE_CLASSES[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
