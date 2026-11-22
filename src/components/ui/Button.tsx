"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline-amber"
  | "outline-blue"
  | "outline-red"
  | "outline-slate"
  | "ghost";

type ButtonSize = "xs" | "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-700 hover:bg-blue-800 text-white border border-transparent",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  success:
    "bg-emerald-700 hover:bg-emerald-800 text-white border border-transparent",
  danger: "bg-red-700 hover:bg-red-800 text-white border border-transparent",
  "outline-amber":
    "bg-transparent hover:bg-amber-50 text-amber-700 border border-amber-200",
  "outline-blue":
    "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200",
  "outline-red":
    "bg-transparent hover:bg-red-50 text-red-700 border border-red-200",
  "outline-slate":
    "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600 border border-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "p-1.5 rounded-lg text-xs",
  sm: "px-3.5 py-2 rounded-lg text-xs font-semibold",
  md: "px-4 py-2.5 rounded-xl text-sm font-medium",
};

export function Button({
  variant = "primary",
  size = "sm",
  loading = false,
  icon,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  );
}
