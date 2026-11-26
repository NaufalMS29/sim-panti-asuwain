import { getAllJadwalKunjungan } from "@/features/kunjungan/services/kunjungan.service";
import { KunjunganClientPage } from "@/features/kunjungan/components/KunjunganClientPage";

export const dynamic = "force-dynamic";

export default async function JadwalKunjunganPage() {
  const data = await getAllJadwalKunjungan();

  return <KunjunganClientPage initialData={data} />;
}
