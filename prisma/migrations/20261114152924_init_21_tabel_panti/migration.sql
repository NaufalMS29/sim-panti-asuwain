-- CreateTable
CREATE TABLE `roles` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_role` VARCHAR(50) NOT NULL,
    `deskripsi` VARCHAR(255) NULL,

    UNIQUE INDEX `roles_nama_role_key`(`nama_role`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `password` VARCHAR(255) NULL,
    `google_id` VARCHAR(100) NULL,
    `otp_code` VARCHAR(6) NULL,
    `otp_expires_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_google_id_key`(`google_id`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anak_panti` (
    `id_anak` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `nama_anak` VARCHAR(100) NOT NULL,
    `nik` VARCHAR(16) NULL,
    `tempat_lahir` VARCHAR(50) NOT NULL,
    `tanggal_lahir` DATE NOT NULL,
    `jenis_kelamin` ENUM('L', 'P') NOT NULL,
    `status_anak` ENUM('Yatim', 'Piatu', 'Yatim Piatu', 'Duafa') NOT NULL,
    `tanggal_masuk` DATE NOT NULL,
    `foto` VARCHAR(255) NULL,

    UNIQUE INDEX `anak_panti_id_user_key`(`id_user`),
    PRIMARY KEY (`id_anak`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berkas_anak` (
    `id_berkas` INTEGER NOT NULL AUTO_INCREMENT,
    `id_anak` INTEGER NOT NULL,
    `jenis_berkas` ENUM('ijazah', 'akta_kelahiran', 'kartu_keluarga', 'sertifikat') NOT NULL,
    `nama_berkas` VARCHAR(100) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `uploaded_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_berkas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alumni` (
    `id_alumni` INTEGER NOT NULL AUTO_INCREMENT,
    `id_anak` INTEGER NOT NULL,
    `tahun_lulus` YEAR NOT NULL,
    `pekerjaan_sekarang` VARCHAR(100) NULL,
    `kontak` VARCHAR(20) NULL,
    `alamat_sekarang` TEXT NULL,

    UNIQUE INDEX `alumni_id_anak_key`(`id_anak`),
    PRIMARY KEY (`id_alumni`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengurus` (
    `id_pengurus` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `nama_pengurus` VARCHAR(100) NOT NULL,
    `jabatan` VARCHAR(50) NOT NULL,
    `no_telepon` VARCHAR(20) NOT NULL,
    `alamat` TEXT NOT NULL,

    UNIQUE INDEX `pengurus_id_user_key`(`id_user`),
    PRIMARY KEY (`id_pengurus`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donatur` (
    `id_donatur` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `nama_donatur` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `no_telepon` VARCHAR(20) NULL,
    `alamat` TEXT NULL,
    `tipe_donatur` ENUM('tetap', 'tidak_tetap', 'simpatisan') NOT NULL DEFAULT 'tidak_tetap',
    `frekuensi_donasi` VARCHAR(50) NULL,

    UNIQUE INDEX `donatur_id_user_key`(`id_user`),
    PRIMARY KEY (`id_donatur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donasi` (
    `id_donasi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_donatur` INTEGER NULL,
    `kode_donasi` VARCHAR(30) NOT NULL,
    `nama_pengirim` VARCHAR(100) NOT NULL,
    `tanggal_donasi` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `jenis_donasi` ENUM('uang', 'barang') NOT NULL,
    `is_anonim` BOOLEAN NOT NULL DEFAULT false,
    `status_verifikasi` ENUM('pending', 'terverifikasi', 'ditolak') NOT NULL DEFAULT 'pending',
    `bukti_pembayaran` VARCHAR(255) NULL,
    `catatan` TEXT NULL,

    UNIQUE INDEX `donasi_kode_donasi_key`(`kode_donasi`),
    PRIMARY KEY (`id_donasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donasi_uang` (
    `id_donasi_uang` INTEGER NOT NULL AUTO_INCREMENT,
    `id_donasi` INTEGER NOT NULL,
    `nominal` DECIMAL(12, 2) NOT NULL,
    `metode_pembayaran` ENUM('transfer_bank', 'qris', 'tunai') NOT NULL,

    UNIQUE INDEX `donasi_uang_id_donasi_key`(`id_donasi`),
    PRIMARY KEY (`id_donasi_uang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donasi_barang` (
    `id_donasi_barang` INTEGER NOT NULL AUTO_INCREMENT,
    `id_donasi` INTEGER NOT NULL,
    `nama_barang` VARCHAR(100) NOT NULL,
    `kategori_barang` ENUM('habis_pakai', 'inventaris') NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `satuan` VARCHAR(20) NOT NULL,
    `nomor_resi_ekspedisi` VARCHAR(50) NULL,

    UNIQUE INDEX `donasi_barang_id_donasi_key`(`id_donasi`),
    PRIMARY KEY (`id_donasi_barang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logistik_habis_pakai` (
    `id_logistik` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_barang` VARCHAR(100) NOT NULL,
    `kategori` VARCHAR(50) NOT NULL,
    `stok_jumlah` INTEGER NOT NULL DEFAULT 0,
    `satuan` VARCHAR(20) NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id_logistik`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logistik_keluar` (
    `id_logistik_keluar` INTEGER NOT NULL AUTO_INCREMENT,
    `id_logistik` INTEGER NOT NULL,
    `id_pengurus` INTEGER NOT NULL,
    `jumlah_keluar` INTEGER NOT NULL,
    `tanggal_keluar` DATE NOT NULL,
    `peruntukan` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_logistik_keluar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventaris_barang` (
    `id_inventaris` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_inventaris` VARCHAR(50) NOT NULL,
    `nama_barang` VARCHAR(100) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `kondisi` ENUM('baik', 'rusak_ringan', 'rusak_berat') NOT NULL DEFAULT 'baik',
    `lokasi_penyimpanan` VARCHAR(100) NOT NULL,
    `tgl_perolehan` DATE NOT NULL,

    UNIQUE INDEX `inventaris_barang_kode_inventaris_key`(`kode_inventaris`),
    PRIMARY KEY (`id_inventaris`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_kas` (
    `id_kategori_kas` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(100) NOT NULL,
    `jenis_kas` ENUM('pemasukan', 'pengeluaran') NOT NULL,

    PRIMARY KEY (`id_kategori_kas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_kas` (
    `id_transaksi_kas` INTEGER NOT NULL AUTO_INCREMENT,
    `id_kategori_kas` INTEGER NOT NULL,
    `id_donasi_uang` INTEGER NULL,
    `id_pengurus` INTEGER NOT NULL,
    `tanggal_transaksi` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `nominal` DECIMAL(12, 2) NOT NULL,
    `jenis_transaksi` ENUM('pemasukan', 'pengeluaran') NOT NULL,
    `keterangan` TEXT NOT NULL,
    `file_nota` VARCHAR(255) NULL,

    UNIQUE INDEX `transaksi_kas_id_donasi_uang_key`(`id_donasi_uang`),
    PRIMARY KEY (`id_transaksi_kas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_kunjungan` (
    `id_kunjungan` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_tiket` VARCHAR(30) NOT NULL,
    `nama_pengunjung` VARCHAR(100) NOT NULL,
    `no_telepon` VARCHAR(20) NOT NULL,
    `instansi_organisasi` VARCHAR(100) NULL,
    `tujuan_kunjungan` TEXT NOT NULL,
    `tanggal_rencana` DATE NOT NULL,
    `jam_rencana` TIME(0) NOT NULL,
    `jumlah_rombongan` INTEGER NOT NULL,
    `status_kunjungan` ENUM('pending', 'disetujui', 'ditolak') NOT NULL DEFAULT 'pending',
    `catatan_pengurus` TEXT NULL,

    UNIQUE INDEX `jadwal_kunjungan_kode_tiket_key`(`kode_tiket`),
    PRIMARY KEY (`id_kunjungan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_profil_panti` (
    `id_profil` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_panti` VARCHAR(100) NOT NULL,
    `sejarah` TEXT NOT NULL,
    `visi_misi` TEXT NOT NULL,
    `no_rekening_bank` VARCHAR(50) NOT NULL,
    `qr_code_qris` VARCHAR(255) NULL,
    `alamat` TEXT NOT NULL,
    `email_resmi` VARCHAR(100) NOT NULL,
    `no_wa_resmi` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id_profil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_struktur_organisasi` (
    `id_struktur` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_pengurus` VARCHAR(100) NOT NULL,
    `jabatan` VARCHAR(50) NOT NULL,
    `foto` VARCHAR(255) NULL,
    `urutan` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id_struktur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_kegiatan` (
    `id_kegiatan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pengurus` INTEGER NULL,
    `judul_kegiatan` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `isi_berita` TEXT NOT NULL,
    `foto_banner` VARCHAR(255) NULL,
    `tanggal_pelaksanaan` DATE NOT NULL,

    UNIQUE INDEX `cms_kegiatan_slug_key`(`slug`),
    PRIMARY KEY (`id_kegiatan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_kebutuhan_panti` (
    `id_kebutuhan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kebutuhan` VARCHAR(100) NOT NULL,
    `jenis_kebutuhan` ENUM('uang', 'barang') NOT NULL,
    `target_jumlah` INTEGER NOT NULL,
    `jumlah_terkumpul` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('belum_terpenuhi', 'terpenuhi_sebagian', 'terpenuhi') NOT NULL DEFAULT 'belum_terpenuhi',

    PRIMARY KEY (`id_kebutuhan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_legalitas` (
    `id_legalitas` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_dokumen` VARCHAR(100) NOT NULL,
    `nomor_dokumen` VARCHAR(100) NOT NULL,
    `penerbit` VARCHAR(100) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_legalitas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anak_panti` ADD CONSTRAINT `anak_panti_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berkas_anak` ADD CONSTRAINT `berkas_anak_id_anak_fkey` FOREIGN KEY (`id_anak`) REFERENCES `anak_panti`(`id_anak`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alumni` ADD CONSTRAINT `alumni_id_anak_fkey` FOREIGN KEY (`id_anak`) REFERENCES `anak_panti`(`id_anak`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengurus` ADD CONSTRAINT `pengurus_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donatur` ADD CONSTRAINT `donatur_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donasi` ADD CONSTRAINT `donasi_id_donatur_fkey` FOREIGN KEY (`id_donatur`) REFERENCES `donatur`(`id_donatur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donasi_uang` ADD CONSTRAINT `donasi_uang_id_donasi_fkey` FOREIGN KEY (`id_donasi`) REFERENCES `donasi`(`id_donasi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donasi_barang` ADD CONSTRAINT `donasi_barang_id_donasi_fkey` FOREIGN KEY (`id_donasi`) REFERENCES `donasi`(`id_donasi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_keluar` ADD CONSTRAINT `logistik_keluar_id_logistik_fkey` FOREIGN KEY (`id_logistik`) REFERENCES `logistik_habis_pakai`(`id_logistik`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_keluar` ADD CONSTRAINT `logistik_keluar_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_kategori_kas_fkey` FOREIGN KEY (`id_kategori_kas`) REFERENCES `kategori_kas`(`id_kategori_kas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_donasi_uang_fkey` FOREIGN KEY (`id_donasi_uang`) REFERENCES `donasi_uang`(`id_donasi_uang`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cms_kegiatan` ADD CONSTRAINT `cms_kegiatan_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE SET NULL ON UPDATE CASCADE;
