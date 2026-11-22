"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Link2,
  PackageMinus,
  PackagePlus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import {
  LogistikHabisPakaiItem,
  LogistikKeluarItem,
  LogistikMasukItem,
} from "../../types/inventaris.types";
import {
  exportLogistikCsv,
  LOW_STOCK_THRESHOLD,
} from "../../utils/inventaris.utils";

export type LogistikStatusStokFilter = "semua" | "menipis" | "habis";

interface LogistikTabSectionProps {
  logistikList: LogistikHabisPakaiItem[];
  logistikMasukList: LogistikMasukItem[];
  logistikKeluarList: LogistikKeluarItem[];
  statusStokFilter: LogistikStatusStokFilter;
  onStatusStokFilterChange: (filter: LogistikStatusStokFilter) => void;
  canManage: boolean;
  loading: boolean;
  onOpenMasuk: (preselectedId?: number) => void;
  onOpenKeluar: (preselectedId?: number) => void;
  onRequestDeleteMasuk: (item: LogistikMasukItem) => void;
  onRequestDeleteKeluar: (item: LogistikKeluarItem) => void;
}

export function LogistikTabSection({
  logistikList,
  logistikMasukList,
  logistikKeluarList,
  statusStokFilter,
  onStatusStokFilterChange,
  canManage,
  loading,
  onOpenMasuk,
  onOpenKeluar,
  onRequestDeleteMasuk,
  onRequestDeleteKeluar,
}: LogistikTabSectionProps) {
  const [subTab, setSubTab] = useState<"stok" | "masuk" | "keluar">("stok");
  const [search, setSearch] = useState("");

  const filteredStok = logistikList.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_barang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q);

    const matchStatus =
      statusStokFilter === "semua" ||
      (statusStokFilter === "habis" && item.stok_jumlah === 0) ||
      (statusStokFilter === "menipis" &&
        item.stok_jumlah > 0 &&
        item.stok_jumlah <= LOW_STOCK_THRESHOLD);

    return matchSearch && matchStatus;
  });

  const filteredMasuk = logistikMasukList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q) ||
      (item.kode_donasi || "").toLowerCase().includes(q)
    );
  });

  const filteredKeluar = logistikKeluarList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(q) ||
      item.peruntukan.toLowerCase().includes(q) ||
      (item.pencatat_nama || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Sub-navigation Kartu Stok & Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab("stok")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                subTab === "stok"
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Saldo Stok Gudang ({logistikList.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("masuk")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                subTab === "masuk"
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Riwayat Masuk ({logistikMasukList.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("keluar")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                subTab === "keluar"
                  ? "bg-amber-700 text-white border-amber-700"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Riwayat Keluar ({logistikKeluarList.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4 text-emerald-700" />}
              onClick={() => exportLogistikCsv(filteredStok)}
              disabled={filteredStok.length === 0}
            >
              Ekspor Stok CSV
            </Button>

            {canManage && (
              <>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  icon={<PackagePlus className="w-4 h-4" />}
                  onClick={() => onOpenMasuk()}
                >
                  Barang Masuk
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<PackageMinus className="w-4 h-4" />}
                  onClick={() => onOpenKeluar()}
                  disabled={
                    logistikList.filter((i) => i.stok_jumlah > 0).length === 0
                  }
                >
                  Barang Keluar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div
            className={`relative ${subTab === "stok" ? "sm:col-span-9" : "sm:col-span-12"}`}
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                subTab === "stok"
                  ? "Cari nama barang atau kategori logistik..."
                  : subTab === "masuk"
                    ? "Cari nama barang, keterangan, atau kode donasi..."
                    : "Cari nama barang, peruntukan, atau pengurus..."
              }
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {subTab === "stok" && (
            <select
              value={statusStokFilter}
              onChange={(e) =>
                onStatusStokFilterChange(
                  e.target.value as LogistikStatusStokFilter,
                )
              }
              aria-label="Filter Status Stok"
              className="sm:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="semua">Semua Status Stok</option>
              <option value="menipis">
                Stok Menipis (&le;{LOW_STOCK_THRESHOLD})
              </option>
              <option value="habis">Stok Habis (0)</option>
            </select>
          )}
        </div>
      </div>

      {/* Konten Sub-Tab 1: Saldo Stok Gudang */}
      {subTab === "stok" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Sisa Stok</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Update Terakhir</th>
                  {canManage && (
                    <th className="py-3.5 px-4 text-right">Aksi Cepat</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredStok.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 6 : 5}
                      className="py-10 text-center text-gray-500 text-sm"
                    >
                      Belum ada data barang logistik habis pakai yang sesuai
                      dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStok.map((item) => {
                    const isHabis = item.stok_jumlah === 0;
                    const isMenipis =
                      item.stok_jumlah > 0 &&
                      item.stok_jumlah <= LOW_STOCK_THRESHOLD;

                    return (
                      <tr
                        key={item.id_logistik}
                        className={
                          isHabis
                            ? "bg-red-50/40 hover:bg-red-50/70"
                            : isMenipis
                              ? "bg-amber-50/40 hover:bg-amber-50/70"
                              : "hover:bg-gray-50/70"
                        }
                      >
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {item.nama_barang}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600">
                          {item.kategori}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                            isHabis
                              ? "text-red-700"
                              : isMenipis
                                ? "text-amber-700"
                                : "text-gray-900"
                          }`}
                        >
                          {item.stok_jumlah} {item.satuan}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isHabis ? (
                            <Badge variant="red">Habis</Badge>
                          ) : isMenipis ? (
                            <Badge variant="amber">Menipis</Badge>
                          ) : (
                            <Badge variant="emerald">Tersedia</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {item.updated_at_display}
                        </td>
                        {canManage && (
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline-blue"
                                size="xs"
                                onClick={() => onOpenMasuk(item.id_logistik)}
                                title="Tambah Stok Masuk"
                              >
                                + Masuk
                              </Button>
                              <Button
                                type="button"
                                variant="outline-amber"
                                size="xs"
                                disabled={isHabis}
                                onClick={() => onOpenKeluar(item.id_logistik)}
                                title="Catat Pemakaian Keluar"
                              >
                                - Pakai
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Sub-Tab 2: Riwayat Barang Masuk */}
      {subTab === "masuk" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Tanggal & Sumber</th>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-right">Jumlah Masuk</th>
                  {canManage && (
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredMasuk.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 5 : 4}
                      className="py-10 text-center text-gray-500 text-sm"
                    >
                      Belum ada riwayat penerimaan logistik.
                    </td>
                  </tr>
                ) : (
                  filteredMasuk.map((m) => (
                    <tr
                      key={m.id_logistik_masuk}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-semibold text-gray-900">
                          {m.tanggal_masuk_display}
                        </p>
                        <div className="mt-1">
                          {m.is_auto_donasi ? (
                            <Badge
                              variant="blue"
                              icon={<Link2 className="w-3 h-3" />}
                              className="text-[10px] font-mono"
                            >
                              {m.kode_donasi}
                            </Badge>
                          ) : (
                            <Badge variant="slate" className="text-[10px]">
                              Input Manual
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-semibold text-gray-900 text-sm">
                          {m.nama_barang}
                        </p>
                        <p className="text-gray-500">{m.kategori}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-md">
                        <p className="text-gray-800">{m.keterangan}</p>
                        {m.pencatat_nama && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Dicatat oleh: {m.pencatat_nama}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        + {m.jumlah_masuk} {m.satuan}
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {!m.is_auto_donasi && (
                            <Button
                              type="button"
                              variant="outline-red"
                              size="xs"
                              disabled={loading}
                              onClick={() => onRequestDeleteMasuk(m)}
                              title="Hapus Riwayat Masuk Manual"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Sub-Tab 3: Riwayat Barang Keluar */}
      {subTab === "keluar" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Tanggal Keluar</th>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4">Peruntukan Pemakaian</th>
                  <th className="py-3.5 px-4 text-right">Jumlah Keluar</th>
                  {canManage && (
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredKeluar.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 5 : 4}
                      className="py-10 text-center text-gray-500 text-sm"
                    >
                      Belum ada catatan pemakaian logistik keluar.
                    </td>
                  </tr>
                ) : (
                  filteredKeluar.map((k) => (
                    <tr
                      key={k.id_logistik_keluar}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-900">
                        {k.tanggal_keluar_display}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-semibold text-gray-900 text-sm">
                          {k.nama_barang}
                        </p>
                        <p className="text-gray-500">{k.kategori}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-md">
                        <p className="text-gray-800">{k.peruntukan}</p>
                        {k.pencatat_nama && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Dicatat oleh: {k.pencatat_nama}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-red-700 whitespace-nowrap">
                        - {k.jumlah_keluar} {k.satuan}
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            type="button"
                            variant="outline-red"
                            size="xs"
                            disabled={loading}
                            onClick={() => onRequestDeleteKeluar(k)}
                            title="Batalkan Pemakaian & Kembalikan Stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
