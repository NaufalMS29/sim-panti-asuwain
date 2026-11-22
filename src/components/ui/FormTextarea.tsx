"use client";

import React from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function FormTextarea({
  label,
  hint,
  error,
  required,
  rows = 3,
  className = "",
  ...props
}: FormTextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        required={required}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-[11px] text-gray-500 mt-1">{hint}</p>
      )}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
