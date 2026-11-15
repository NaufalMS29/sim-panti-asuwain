import { z } from "zod";

export const uploadBerkasMetaSchema = z
  .object({
    id_anak: z.coerce.number().int().positive("ID anak panti tidak valid."),
    jenis_berkas: z.string().trim().min(1, "Jenis berkas wajib dipilih."),
    nama_file: z
      .string()
      .trim()
      .max(150, "Keterangan nama berkas maksimal 150 karakter.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.jenis_berkas === "lainnya") {
        return Boolean(data.nama_file && data.nama_file.trim().length >= 3);
      }
      return true;
    },
    {
      message:
        "Untuk kategori Lainnya, nama atau jenis berkas wajib diisi minimal 3 karakter.",
      path: ["nama_file"],
    },
  );
