"use client";

import { useState } from "react";
import { AlertBanner, ConfirmModal } from "@/components/ui";
import {
  AnakBerkasDetail,
  BerkasAnakActionResponse,
  BerkasAnakItem,
} from "../types/berkas-anak.types";
import { deleteBerkasAnakAction } from "../actions/berkas-anak.actions";
import { BerkasAnakProfileHeader } from "./BerkasAnakProfileHeader";
import { BerkasUploadFormCard } from "./BerkasUploadFormCard";
import { BerkasAnakTable } from "./BerkasAnakTable";
import { BerkasPreviewModal } from "./BerkasPreviewModal";

interface BerkasAnakDetailClientProps {
  detail: AnakBerkasDetail;
  canManage: boolean;
  jenisBerkasOptions: string[];
}

export function BerkasAnakDetailClient({
  detail,
  canManage,
  jenisBerkasOptions,
}: BerkasAnakDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [previewItem, setPreviewItem] = useState<BerkasAnakItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BerkasAnakItem | null>(null);

  const handleActionResult = (res: BerkasAnakActionResponse) => {
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteBerkasAnakAction(deleteTarget.id_berkas);
    setLoading(false);
    setDeleteTarget(null);
    handleActionResult(res);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <BerkasAnakProfileHeader detail={detail} />

      {banner && (
        <AlertBanner
          type={banner.type}
          message={banner.text}
          onClose={() => setBanner(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {canManage && (
          <BerkasUploadFormCard
            idAnak={detail.id_anak}
            jenisBerkasOptions={jenisBerkasOptions}
            loading={loading}
            onLoadingChange={setLoading}
            onResult={handleActionResult}
          />
        )}

        <BerkasAnakTable
          berkasList={detail.berkas}
          canManage={canManage}
          loading={loading}
          onPreview={setPreviewItem}
          onDelete={setDeleteTarget}
        />
      </div>

      <BerkasPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Berkas Dokumen"
        variant="danger"
        confirmLabel="Ya, Hapus Berkas"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus dokumen{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_file}
              </span>{" "}
              secara permanen? File yang telah dihapus tidak dapat dipulihkan.
            </>
          )
        }
      />
    </div>
  );
}
