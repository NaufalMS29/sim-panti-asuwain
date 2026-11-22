"use client";

import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui";
import { isPdfFile } from "../utils/keuangan.utils";

interface KeuanganNotaPreviewModalProps {
  preview: { title: string; path: string } | null;
  onClose: () => void;
}

export function KeuanganNotaPreviewModal({
  preview,
  onClose,
}: KeuanganNotaPreviewModalProps) {
  return (
    <Modal
      open={Boolean(preview)}
      onClose={onClose}
      title={preview?.title ?? "Pratinjau Nota Kas"}
      maxWidth="3xl"
      headerActions={
        preview && (
          <a
            href={preview.path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tab Baru
          </a>
        )
      }
    >
      {preview && (
        <div className="bg-slate-100 rounded-xl border border-gray-200 p-4 flex items-center justify-center min-h-96 overflow-auto">
          {isPdfFile(preview.path) ? (
            <iframe
              src={preview.path}
              title={preview.title}
              className="w-full h-[65vh] rounded-xl border border-gray-300 bg-white"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.path}
              alt={preview.title}
              className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md bg-white"
            />
          )}
        </div>
      )}
    </Modal>
  );
}
