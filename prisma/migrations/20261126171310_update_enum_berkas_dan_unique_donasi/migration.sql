/*
  Warnings:

  - The values [akta_kelahiran] on the enum `berkas_anak_jenis_berkas` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[id_donasi_barang]` on the table `inventaris_barang` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `logistik_keluar` DROP FOREIGN KEY `logistik_keluar_id_pengurus_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi_kas` DROP FOREIGN KEY `transaksi_kas_id_donasi_uang_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi_kas` DROP FOREIGN KEY `transaksi_kas_id_pengurus_fkey`;

-- DropIndex
DROP INDEX `logistik_keluar_id_pengurus_fkey` ON `logistik_keluar`;

-- DropIndex
DROP INDEX `transaksi_kas_id_pengurus_fkey` ON `transaksi_kas`;

-- AlterTable
ALTER TABLE `berkas_anak` MODIFY `jenis_berkas` ENUM('ijazah', 'akta', 'kartu_keluarga', 'sertifikat', 'rapor', 'ktp', 'lainnya') NOT NULL;

-- AlterTable
ALTER TABLE `inventaris_barang` ADD COLUMN `id_donasi_barang` INTEGER NULL,
    ADD COLUMN `keterangan` TEXT NULL;

-- AlterTable
ALTER TABLE `jadwal_kunjungan` ADD COLUMN `email_pengunjung` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `logistik_habis_pakai` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `logistik_keluar` ADD COLUMN `id_user` INTEGER NULL,
    MODIFY `id_pengurus` INTEGER NULL;

-- AlterTable
ALTER TABLE `transaksi_kas` ADD COLUMN `id_user` INTEGER NULL,
    MODIFY `id_pengurus` INTEGER NULL,
    MODIFY `tanggal_transaksi` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `logistik_masuk` (
    `id_logistik_masuk` INTEGER NOT NULL AUTO_INCREMENT,
    `id_logistik` INTEGER NOT NULL,
    `id_donasi_barang` INTEGER NULL,
    `id_pengurus` INTEGER NULL,
    `id_user` INTEGER NULL,
    `jumlah_masuk` INTEGER NOT NULL,
    `tanggal_masuk` DATE NOT NULL,
    `keterangan` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `logistik_masuk_id_donasi_barang_key`(`id_donasi_barang`),
    PRIMARY KEY (`id_logistik_masuk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `inventaris_barang_id_donasi_barang_key` ON `inventaris_barang`(`id_donasi_barang`);

-- AddForeignKey
ALTER TABLE `logistik_masuk` ADD CONSTRAINT `logistik_masuk_id_logistik_fkey` FOREIGN KEY (`id_logistik`) REFERENCES `logistik_habis_pakai`(`id_logistik`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_masuk` ADD CONSTRAINT `logistik_masuk_id_donasi_barang_fkey` FOREIGN KEY (`id_donasi_barang`) REFERENCES `donasi_barang`(`id_donasi_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_masuk` ADD CONSTRAINT `logistik_masuk_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_masuk` ADD CONSTRAINT `logistik_masuk_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_keluar` ADD CONSTRAINT `logistik_keluar_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistik_keluar` ADD CONSTRAINT `logistik_keluar_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaris_barang` ADD CONSTRAINT `inventaris_barang_id_donasi_barang_fkey` FOREIGN KEY (`id_donasi_barang`) REFERENCES `donasi_barang`(`id_donasi_barang`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_pengurus_fkey` FOREIGN KEY (`id_pengurus`) REFERENCES `pengurus`(`id_pengurus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_kas` ADD CONSTRAINT `transaksi_kas_id_donasi_uang_fkey` FOREIGN KEY (`id_donasi_uang`) REFERENCES `donasi_uang`(`id_donasi_uang`) ON DELETE CASCADE ON UPDATE CASCADE;
