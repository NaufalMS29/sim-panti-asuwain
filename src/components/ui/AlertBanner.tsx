"use client";

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const ALERT_STYLES: Record<
  AlertType,
  { container: string; icon: typeof CheckCircle2 }
> = {
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: CheckCircle2,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-700",
    icon: AlertCircle,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: AlertTriangle,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
  },
};

export function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  const { container, icon: Icon } = ALERT_STYLES[type];

  return (
    <div
      className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${container}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="opacity-70 hover:opacity-100 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
