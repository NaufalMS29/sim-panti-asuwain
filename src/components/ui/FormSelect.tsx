"use client";

import React from "react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function FormSelect({
  label,
  error,
  required,
  className = "",
  children,
  ...props
}: FormSelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
