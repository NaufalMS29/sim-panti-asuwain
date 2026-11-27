# SIM Panti Asuhan Asuwain Timor

Sistem Informasi Manajemen (SIM) berbasis web untuk pengelolaan operasional, administrasi data anak asuh, transaksi donasi, keuangan, inventaris, publikasi kegiatan/berita, serta layanan penjadwalan kunjungan tamu pada **Panti Asuhan Asuwain Timor**.

---

## Fitur Utama

### 1. Manajemen Internal & Kontrol Akses Berbasis Peran (RBAC)

Sistem membatasi akses halaman dan aksi server berdasarkan 5 peran pengguna yang terpusat pada `src/lib/rbac.ts`:

| Peran (Role)                    | Hak Akses & Modul Utama                                                                                                                                                                                                                   |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**                       | Akses penuh ke seluruh modul: Manajemen Akun, Data Pengurus, Data Anak Panti & Alumni, Data Donatur, Kelola & Verifikasi Donasi, Keuangan Panti, Inventaris Barang, Jadwal Kegiatan, Berita & Artikel, serta Verifikasi Jadwal Kunjungan. |
| **Pengurus Panti**              | Mengelola Data Anak Panti & Alumni, Data Donatur, Verifikasi Donasi, Keuangan Panti, Inventaris Barang, Jadwal Kegiatan, Berita & Artikel, serta Verifikasi Jadwal Kunjungan.                                                             |
| **Anak Panti**                  | Melihat Jadwal Kegiatan, Berita & Artikel, mengunduh/melihat Berkas Pribadi (`/dashboard/berkas-saya`), serta mengelola Profil Pribadi.                                                                                                   |
| **Donatur Tetap & Tidak Tetap** | Login menggunakan Google OAuth atau Email OTP, mengajukan donasi, memantau riwayat Donasi Saya (`/dashboard/donasi-saya`), serta mengakses informasi kegiatan dan berita panti.                                                           |

### 2. Layanan Publik & Jadwal Kunjungan (`/kunjungan`)

- **Pengajuan Jadwal Online:** Pengunjung dapat mengajukan permohonan kunjungan sosial atau penyaluran bantuan secara mandiri tanpa perlu membuat akun.
- **Antrian Kronologis (FIFO) & Deteksi Bentrok:** Sistem mencegah tabrakan jadwal pada slot tanggal dan jam yang sudah disetujui, serta memberi tanda peringatan pada pengurus apabila terdapat pengajuan di waktu bersamaan.
- **Notifikasi Email Otomatis (SMTP):** Mengirimkan bukti kode tiket unik (`KNJ-YYYYMMDD-XXXX`) saat pendaftaran, pemberitahuan pengajuan masuk ke email panti, serta e-tiket resmi atau catatan penolakan ke email pengunjung setelah diverifikasi.
- **Cek Status & Cetak E-Tiket Mandiri:** Pengunjung dapat melacak status pengajuan secara real-time menggunakan kode tiket dan mencetak bukti persetujuan.
- **Keamanan Form Publik:** Dilengkapi validasi skema ketat (Zod), _IP-based rate limiting_, pembatasan tiket aktif per email, _honeypot field_, dan _minimum submission time check_ untuk mencegah spam bot.

---

## Teknologi yang Digunakan

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack, Standalone Output)
- **Bahasa & UI:** TypeScript, React 19, Tailwind CSS v4, Lucide React
- **Autentikasi:** Auth.js v5 (`next-auth`) — Google OAuth & Verifikasi OTP Email
- **Database & ORM:** MySQL (`db_panti_asuwain`) & Prisma ORM v6
- **Validasi & Layanan Email:** Zod v4 & Nodemailer (Gmail SMTP)
- **Kontainerisasi:** Docker & Docker Compose (Node 20 Bookworm Slim)

---

## Konfigurasi Environment (`.env`)

Salin atau buat file `.env` pada direktori root proyek dan sesuaikan nilainya:

```env
# Koneksi Database MySQL
DATABASE_URL="isi_dengan_url_database"

# Auth.js & Google OAuth
AUTH_SECRET="isi_dengan_random_secret_minimal_32_karakter"
AUTH_GOOGLE_ID="google_client_id_anda"
AUTH_GOOGLE_SECRET="google_client_secret_anda"

# SMTP Gmail (OTP Donatur & Notifikasi Jadwal Kunjungan)
SMTP_EMAIL="emailpanti@gmail.com"
SMTP_APP_PASSWORD="app_password_gmail_16_digit"

# Konfigurasi Layanan Kunjungan & URL Aplikasi
PANTI_EMAIL="emailpanti@gmail.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Cara Menjalankan (Mode Development Lokal)

1. **Instal seluruh dependensi:**

   ```bash
   npm install
   ```

2. **Pastikan layanan MySQL (XAMPP/Laragon) aktif**, lalu sinkronkan skema Prisma ke database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Jalankan server pengembangan:**

   ```bash
   npm run dev
   ```

4. Buka `http://localhost:3000` di browser (halaman publik kunjungan tersedia di `http://localhost:3000/kunjungan`).

---

## Cara Menjalankan dengan Docker

Konfigurasi Docker pada proyek ini dirancang agar container aplikasi terhubung langsung ke **MySQL XAMPP lokal** di mesin host dan menyimpan unggahan pengguna ke folder `./public/uploads`.

1. **Izinkan akses koneksi database dari jaringan Docker (sekali saja) jalankan:**

   ```sql
   GRANT ALL PRIVILEGES ON db_panti_asuwain.* TO 'root'@'%' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   ```

2. **Build image dan jalankan container:**

   ```bash
   docker compose up -d --build
   ```

3. **Akses aplikasi:**
   Buka `http://localhost:3000` pada browser.

### Perintah Pengelolaan Container

- **Melihat log aplikasi secara real-time:**
  ```bash
  docker compose logs -f web
  ```
- **Menghentikan dan menghapus container:**
  ```bash
  docker compose down
  ```
- **Menyalakan ulang container setelah perubahan `.env`:**
  ```bash
  docker compose up -d
  ```
