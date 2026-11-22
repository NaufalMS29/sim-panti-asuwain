"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileCheck2, Image as ImageIcon } from "lucide-react";

interface FormFileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  hint?: string;
  error?: string;
  maxSizeMb?: number;
  showImagePreview?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const FormFileInput = React.forwardRef<
  HTMLInputElement,
  FormFileInputProps
>(function FormFileInput(
  {
    label,
    hint,
    error,
    maxSizeMb,
    showImagePreview = false,
    required,
    onChange,
    className = "",
    ...props
  },
  ref,
) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    sizeLabel: string;
    isImage: boolean;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }

    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setLocalError(null);
      setFileMeta(null);
      setPreviewUrl(null);
      onChange?.(e);
      return;
    }

    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
      e.target.value = "";
      setFileMeta(null);
      setPreviewUrl(null);
      setLocalError(
        `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimal ${maxSizeMb} MB.`,
      );
      onChange?.(e);
      return;
    }

    setLocalError(null);
    const isImage = file.type.startsWith("image/");
    setFileMeta({
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      isImage,
    });

    if (showImagePreview && isImage) {
      const objectUrl = URL.createObjectURL(file);
      activeUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    onChange?.(e);
  };

  const displayedError = error || localError;

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <input
        ref={ref}
        type="file"
        required={required}
        onChange={handleFileChange}
        className={`w-full text-xs text-gray-700 border border-gray-300 rounded-lg bg-white p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer ${className}`}
        {...props}
      />

      {fileMeta && !displayedError && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          {fileMeta.isImage ? (
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate font-medium">{fileMeta.name}</span>
          <span className="text-emerald-600 shrink-0">
            ({fileMeta.sizeLabel})
          </span>
        </div>
      )}

      {previewUrl && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
          <img
            src={previewUrl}
            alt="Pratinjau gambar terpilih"
            className="max-h-40 w-auto mx-auto rounded-lg object-contain"
          />
        </div>
      )}

      {hint && !displayedError && (
        <p className="text-[11px] text-gray-500 mt-1">{hint}</p>
      )}
      {displayedError && (
        <p className="text-[11px] text-red-600 mt-1">{displayedError}</p>
      )}
    </div>
  );
});
