"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmVariant = "danger" | "primary" | "success";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const ICON_WRAPPER_CLASSES: Record<ConfirmVariant, string> = {
  danger: "bg-red-50 text-red-600 border-red-200",
  primary: "bg-blue-50 text-blue-600 border-blue-200",
  success: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      maxWidth="sm"
      closeOnBackdrop={!loading}
      onClose={loading ? () => {} : onClose}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${ICON_WRAPPER_CLASSES[variant]}`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-600 leading-relaxed pt-0.5">
            {description}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
