import { PublicKunjunganPortal } from "@/features/kunjungan/components/PublicKunjunganPortal";

interface KunjunganPageProps {
  searchParams: Promise<{ tiket?: string }>;
}

export default async function KunjunganPage({
  searchParams,
}: KunjunganPageProps) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-slate-50">
      <PublicKunjunganPortal initialTicketCode={params.tiket || ""} />
    </main>
  );
}
