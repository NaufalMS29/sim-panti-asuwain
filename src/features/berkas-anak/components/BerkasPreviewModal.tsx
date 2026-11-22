"use client";

import { useEffect } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui";
import { BerkasAnakItem } from "../types/berkas-anak.types";
import { formatEnumLabel, isPdfFile } from "../utils/berkas-anak.utils";

interface BerkasPreviewModalProps {
  item: BerkasAnakItem | null;
  onClose: () => void;
}

export function BerkasPreviewModal({ item, onClose }: BerkasPreviewModalProps) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Badge variant="blue" className="rounded-md shrink-0">
              {formatEnumLabel(item.jenis_berkas)}
            </Badge>
            <h2 className="text-sm font-bold text-gray-900 truncate">
              {item.nama_file}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={item.file_path}
              download={item.nama_file}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh
            </a>

            <a
              href={item.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tab Baru
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Pratinjau"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
          {isPdfFile(item.file_path) ? (
            <iframe
              src={item.file_path}
              title={item.nama_file}
              className="w-full h-full rounded-xl border border-gray-300 bg-white"
            />
          ) : (
            <img
              src={item.file_path}
              alt={item.nama_file}
              className="max-w-full max-h-full object-contain rounded-xl shadow-md bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
