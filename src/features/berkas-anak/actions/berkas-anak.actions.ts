"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { uploadBerkasMetaSchema } from "../schemas/berkas-anak.schema";
import {
  deleteBerkasAnakRecord,
  uploadBerkasAnakRecord,
} from "../services/berkas-anak.service";
import { BerkasAnakActionResponse } from "../types/berkas-anak.types";

async function requireAnakUpdateRole() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;
  assertPermission(role, "anak_panti:update");
}

function revalidateBerkasPaths(id_anak: number) {
  revalidatePath("/dashboard/data-anak-panti");
  revalidatePath(`/dashboard/data-anak-panti/${id_anak}`);
}

export async function uploadBerkasAnakAction(
  formData: FormData,
): Promise<BerkasAnakActionResponse> {
  try {
    await requireAnakUpdateRole();

    const parsed = uploadBerkasMetaSchema.safeParse({
      id_anak: formData.get("id_anak"),
      jenis_berkas: formData.get("jenis_berkas"),
      nama_file: formData.get("nama_file") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Data unggahan tidak valid.",
      };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return {
        success: false,
        message: "Pilih file dokumen (PDF/Gambar) terlebih dahulu.",
      };
    }

    await uploadBerkasAnakRecord({
      id_anak: parsed.data.id_anak,
      jenis_berkas: parsed.data.jenis_berkas,
      customNamaFile: parsed.data.nama_file,
      file,
    });

    revalidateBerkasPaths(parsed.data.id_anak);

    return {
      success: true,
      message: `Berkas "${parsed.data.jenis_berkas.replace(/_/g, " ")}" berhasil diunggah.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengunggah berkas anak.",
    };
  }
}

export async function deleteBerkasAnakAction(
  id_berkas: number,
): Promise<BerkasAnakActionResponse> {
  try {
    await requireAnakUpdateRole();

    const id_anak = await deleteBerkasAnakRecord(id_berkas);
    revalidateBerkasPaths(id_anak);

    return {
      success: true,
      message: "Berkas dokumen berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus berkas anak.",
    };
  }
}
