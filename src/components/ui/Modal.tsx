"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  maxWidth?: ModalMaxWidth;
  closeOnBackdrop?: boolean;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const MAX_WIDTH_CLASSES: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  open,
  title,
  onClose,
  maxWidth = "md",
  closeOnBackdrop = true,
  headerActions,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={closeOnBackdrop ? onClose : undefined}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl border border-gray-200 w-full ${MAX_WIDTH_CLASSES[maxWidth]} p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
