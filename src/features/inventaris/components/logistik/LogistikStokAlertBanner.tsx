"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PackagePlus,
  Siren,
} from "lucide-react";
import { Button } from "@/components/ui";
import { LogistikHabisPakaiItem } from "../../types/inventaris.types";
import { LOW_STOCK_THRESHOLD } from "../../utils/inventaris.utils";

interface LogistikStokAlertBannerProps {
  logistikList: LogistikHabisPakaiItem[];
  canManage: boolean;
  onQuickRestock: (id_logistik: number) => void;
  onNavigateToCriticalStock: (filter: "habis" | "menipis") => void;
}

export function LogistikStokAlertBanner({
  logistikList,
  canManage,
  onQuickRestock,
  onNavigateToCriticalStock,
}: LogistikStokAlertBannerProps) {
  const [expanded, setExpanded] = useState(true);

  const habisItems = logistikList.filter((item) => item.stok_jumlah === 0);
  const menipisItems = logistikList.filter(
    (item) => item.stok_jumlah > 0 && item.stok_jumlah <= LOW_STOCK_THRESHOLD,
  );

  if (habisItems.length === 0 && menipisItems.length === 0) {
    return null;
  }

  const hasOutOfStock = habisItems.length > 0;

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 shadow-2xs transition ${
        hasOutOfStock
          ? "bg-red-50/90 border-red-200 text-red-950"
          : "bg-amber-50/90 border-amber-200 text-amber-950"
      }`}
    >
      {/* Baris Header Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              hasOutOfStock
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-amber-100 text-amber-700 border-amber-300"
            }`}
          >
            {hasOutOfStock ? (
              <Siren className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold leading-snug">
              Peringatan Ketersediaan Stok Logistik
            </p>
            <p
              className={`text-xs mt-0.5 ${
                hasOutOfStock ? "text-red-800" : "text-amber-800"
              }`}
            >
              {habisItems.length > 0 && (
                <span>
                  <strong>{habisItems.length} barang habis</strong> (0 stok)
                </span>
              )}
              {habisItems.length > 0 && menipisItems.length > 0 && " • "}
              {menipisItems.length > 0 && (
                <span>
                  <strong>{menipisItems.length} barang menipis</strong> (sisa
                  &le; {LOW_STOCK_THRESHOLD})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant={hasOutOfStock ? "danger" : "secondary"}
            size="xs"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() =>
              onNavigateToCriticalStock(
                habisItems.length > 0 ? "habis" : "menipis",
              )
            }
          >
            Lihat di Tabel Stok
          </Button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              hasOutOfStock
                ? "bg-white/80 hover:bg-white text-red-800 border-red-200"
                : "bg-white/80 hover:bg-white text-amber-800 border-amber-200"
            }`}
          >
            {expanded ? (
              <>
                Sembunyikan <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Rincian ({habisItems.length + menipisItems.length}){" "}
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Daftar Chip Barang Kritis */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap gap-2">
          {habisItems.map((item) => (
            <div
              key={`habis-${item.id_logistik}`}
              className="inline-flex items-center gap-2 bg-white border border-red-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-semibold text-gray-900">
                {item.nama_barang}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                HABIS (0 {item.satuan})
              </span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onQuickRestock(item.id_logistik)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline ml-1 cursor-pointer"
                >
                  <PackagePlus className="w-3 h-3" />
                  Restok
                </button>
              )}
            </div>
          ))}

          {menipisItems.map((item) => (
            <div
              key={`menipis-${item.id_logistik}`}
              className="inline-flex items-center gap-2 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-gray-900">
                {item.nama_barang}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                Sisa {item.stok_jumlah} {item.satuan}
              </span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onQuickRestock(item.id_logistik)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline ml-1 cursor-pointer"
                >
                  <PackagePlus className="w-3 h-3" />
                  Restok
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
