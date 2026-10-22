import { PrismaClient, Role, StatusPengumuman, TipeSukuBunga } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Users
  const passwordHash = await bcrypt.hash("admin123", 10);
  const karyawanPasswordHash = await bcrypt.hash("karyawan123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Siti Rahmawati (Sekretaris ALCO)",
      password: passwordHash,
      role: Role.ADMIN,
      department: "ALCO / Treasury & Manajemen",
    },
  });

  const karyawan = await prisma.user.upsert({
    where: { email: "karyawan@company.com" },
    update: {},
    create: {
      email: "karyawan@company.com",
      name: "Budi Santoso",
      password: karyawanPasswordHash,
      role: Role.KARYAWAN,
      department: "Pemasaran & Operasional Cabang",
    },
  });

  console.log(`Users created: ${admin.email} (ADMIN), ${karyawan.email} (KARYAWAN)`);

  // 2. Clear old data if needed or populate if empty
  const countPengumuman = await prisma.pengumuman.count();
  if (countPengumuman === 0) {
    // Meeting 1: Published ALCO meeting with Paragraphs, Table, and Drive Link
    const isiKeputusan1 = `### Latar Belakang & Evaluasi Likuiditas
Berdasarkan hasil evaluasi perkembangan indikator makroekonomi, tren pergerakan BI-Rate, serta pemantauan posisi likuiditas perbankan (LDR dan AL/NCD) per akhir September 2026, Komite ALCO memandang perlu melakukan penyesuaian suku bunga acuan produk simpanan dan kredit guna menjaga pertumbuhan DPK yang sehat serta daya saing penyaluran pembiayaan.

### Keputusan Penyesuaian Suku Bunga
Komite memutuskan untuk memberlakukan skema suku bunga baru terhitung mulai tanggal 1 November 2026 dengan rincian matriks sebagai berikut:

| Segmen Produk | Tenor / Tiering | Suku Bunga Lama | Suku Bunga Baru | Berlaku Efektif | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Deposito Rupiah | 1 Bulan | 4.25% p.a. | 4.50% p.a. | 01 Nov 2026 | Counter Rate Cabang |
| Deposito Rupiah | 3 Bulan | 4.75% p.a. | 5.00% p.a. | 01 Nov 2026 | Nominal < Rp 1 Miliar |
| Deposito Rupiah | 6 Bulan | 5.00% p.a. | 5.25% p.a. | 01 Nov 2026 | Nominal < Rp 1 Miliar |
| Tabungan Bisnis Prima | Tiering > Rp 500 Jt | 2.50% p.a. | 2.75% p.a. | 01 Nov 2026 | Bebas Biaya Transaksi |
| Kredit Modal Kerja (KMK) | 1 - 3 Tahun | 9.25% p.a. | 8.95% p.a. | 01 Nov 2026 | Segmen Komersial & SME |
| KPR Primary | Fixed 1 Tahun | 6.50% p.a. | 5.99% p.a. | 01 Nov 2026 | Promo Akhir Tahun |

### Instruksi Tindak Lanjut
1. **Divisi Treasury:** Menyiapkan sosialisasi tarif baru dan pembaruan sistem Core Banking sebelum tanggal 28 Oktober 2026.
2. **Divisi Pemasaran & Cabang:** Menyesuaikan materi promosi dan flyer suku bunga di seluruh touchpoint nasabah.
3. **Divisi Kepatuhan:** Memastikan kepatuhan terhadap batas suku bunga penjaminan Lembaga Penjamin Simpanan (LPS).`;

    const rapat1 = await prisma.pengumuman.create({
      data: {
        judul: "Risalah Rapat Komite ALCO - Penetapan Penyesuaian Suku Bunga DPK & SBDK Q4",
        nomorRapat: "ALCO/BA/2026/X/014",
        tanggalRapat: new Date("2026-10-15T09:30:00Z"),
        lokasi: "Boardroom Lt. 8 & Zoom Teleconference",
        kategori: "ALCO / Treasury",
        status: StatusPengumuman.PUBLISHED,
        ringkasan: "Penyesuaian suku bunga Deposito +25 bps dan penurunan suku bunga promosi KPR menjadi 5.99% p.a. efektif 1 November 2026.",
        isiKeputusan: isiKeputusan1,
        authorId: admin.id,
        lampiran: {
          create: [
            {
              namaFile: "Risalah_Resmi_ALCO_Oktober_2026_Signed.pdf",
              fileUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
              driveFileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
              keterangan: "Dokumen resmi ber-barcode dan bertanda tangan Direksi (Mode Hanya Lihat)",
            },
            {
              namaFile: "Lampiran_Matriks_Simulasi_NIM_2026.pdf",
              fileUrl: "https://drive.google.com/file/d/1_yB1V0j52x9Bq1_ExampleDocIdDrive2026/preview",
              driveFileId: "1_yB1V0j52x9Bq1_ExampleDocIdDrive2026",
              keterangan: "Tabel proyeksi Net Interest Margin & Cost of Fund (Hanya Lihat)",
            },
          ],
        },
      },
    });

    // Meeting 2: Manajemen Operasional
    const isiKeputusan2 = `### Hasil Evaluasi Layanan Cabang
Berdasarkan hasil survei kepuasan nasabah Triwulan III dan audit operasional, disepakati percepatan digitalisasi antrean dan pembakuan SLA pembukaan rekening tabungan.

### Matriks Sasaran Kinerja Operasional Cabang:
| Aspek Layanan | Target Waktu (SLA Lama) | Target Baru (SLA Q4) | Penanggung Jawab |
| :--- | :--- | :--- | :--- |
| Pembukaan Rekening Tabungan | 25 Menit | Maksimal 12 Menit | Customer Service |
| Pengajuan Kartu Debit Pengganti | 15 Menit | Maksimal 8 Menit | Digital Kiosk / CS |
| Pencairan Kredit Produktif SME | 7 Hari Kerja | 4 Hari Kerja | Unit Analis Kredit |

Keputusan ini wajib dipatuhi seluruh Kantor Cabang dan Kantor Cabang Pembantu terhitung sejak pengumuman ini diterbitkan.`;

    await prisma.pengumuman.create({
      data: {
        judul: "Keputusan Rapat Manajemen Operasional - Standardisasi Service Level Agreement (SLA) Cabang",
        nomorRapat: "SK-DIR/OPS/2026/089",
        tanggalRapat: new Date("2026-10-10T14:00:00Z"),
        lokasi: "Ruang Rapat Operasional Lt. 4",
        kategori: "Operasional",
        status: StatusPengumuman.PUBLISHED,
        ringkasan: "Pangkas waktu pembukaan rekening dari 25 menit menjadi 12 menit dan pencairan kredit SME maksimal 4 hari kerja.",
        isiKeputusan: isiKeputusan2,
        authorId: admin.id,
        lampiran: {
          create: [
            {
              namaFile: "Panduan_Implementasi_SLA_Baru_2026.pdf",
              fileUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
              driveFileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
              keterangan: "SOP Operasional Baru (View-Only Google Drive)",
            },
          ],
        },
      },
    });

    // Meeting 3: Draft (Admin only)
    await prisma.pengumuman.create({
      data: {
        judul: "[DRAFT] Usulan Program Insentif Pembiayaan Hijau (Green Financing) 2027",
        nomorRapat: "DRAFT/ALCO/XI/002",
        tanggalRapat: new Date("2026-10-18T10:00:00Z"),
        lokasi: "Hybrid Zoom",
        kategori: "ALCO / Treasury",
        status: StatusPengumuman.DRAFT,
        ringkasan: "Rancangan insentif pemotongan suku bunga 50 bps untuk debitur sektor energi terbarukan dan ramah lingkungan.",
        isiKeputusan: "Dalam tahap review final oleh Direktur Kepatuhan dan Risiko. Menunggu persetujuan Dewan Komisaris.",
        authorId: admin.id,
      },
    });

    console.log("Sample announcements created.");
  }

  // 3. Seed SubTabProduk and BarisSukuBunga (Konvensional)
  const countSubTab = await prisma.subTabProduk.count();
  if (countSubTab === 0) {
    console.log("Seeding SubTabProduk & Suku Bunga...");

    // 3.1. Kredit Produktif
    const tabKreditProduktif = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.KONVENSIONAL,
        nama: "Kredit Produktif",
        slug: "kredit-produktif",
        urutan: 1,
        deskripsi: "Suku bunga pembiayaan modal kerja dan investasi untuk badan usaha & pelaku bisnis.",
        barisRates: {
          create: [
            {
              namaProduk: "Kredit Modal Kerja (KMK) Rekening Koran",
              tenorTiering: "1 Tahun (Perpanjangan Tahunan)",
              ratePersen: "9.25% p.a.",
              saldoMinimal: "Plafon > Rp 500 Juta",
              keterangan: "Suku bunga efektif, agunan fixed asset",
              urutan: 1,
            },
            {
              namaProduk: "Kredit Modal Kerja Berjangka",
              tenorTiering: "1 - 3 Tahun",
              ratePersen: "8.95% p.a.",
              saldoMinimal: "Plafon > Rp 1 Miliar",
              keterangan: "Angsuran pokok & bunga bulanan",
              urutan: 2,
            },
            {
              namaProduk: "Kredit Investasi Mesin & Bangunan",
              tenorTiering: "3 - 5 Tahun",
              ratePersen: "9.50% p.a.",
              saldoMinimal: "Plafon > Rp 2 Miliar",
              keterangan: "Grace period maksimal 6 bulan",
              urutan: 3,
            },
            {
              namaProduk: "Kredit Usaha Rakyat (KUR) Mikro",
              tenorTiering: "Hingga 3 Tahun",
              ratePersen: "6.00% p.a. (Subsidi Pemerintah)",
              saldoMinimal: "Plafon s.d Rp 100 Juta",
              keterangan: "Tanpa agunan tambahan pokok",
              urutan: 4,
            },
          ],
        },
      },
    });

    // 3.2. Kredit Konsumtif
    const tabKreditKonsumtif = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.KONVENSIONAL,
        nama: "Kredit Konsumtif",
        slug: "kredit-konsumtif",
        urutan: 2,
        deskripsi: "Suku bunga pembiayaan konsumsi perorangan, KPR, KKB, dan pinjaman multiguna.",
        barisRates: {
          create: [
            {
              namaProduk: "KPR Griya Prima (Developer Rekanan)",
              tenorTiering: "Fixed 1 Tahun",
              ratePersen: "5.99% p.a. (Promo Q4)",
              saldoMinimal: "Tenor min 10 Tahun",
              keterangan: "Setelah masa fixed berlaku floating cap SBDK + 2.5%",
              urutan: 1,
            },
            {
              namaProduk: "KPR Griya Prima (Developer Rekanan)",
              tenorTiering: "Fixed 3 Tahun",
              ratePersen: "6.75% p.a.",
              saldoMinimal: "Tenor min 12 Tahun",
              keterangan: "Bebas penalti pelunasan sebagian",
              urutan: 2,
            },
            {
              namaProduk: "Kredit Kendaraan Bermotor (KKB) Roda 4 Baru",
              tenorTiering: "1 - 3 Tahun",
              ratePersen: "3.88% Flat p.a.",
              saldoMinimal: "DP minimal 20%",
              keterangan: "Asuransi all-risk rekanan",
              urutan: 3,
            },
            {
              namaProduk: "Kredit Tanpa Agunan (KTA) Payroll",
              tenorTiering: "1 - 5 Tahun",
              ratePersen: "0.85% Flat / Bulan",
              saldoMinimal: "Plafon s.d Rp 250 Juta",
              keterangan: "Khusus instansi kerja sama payroll",
              urutan: 4,
            },
          ],
        },
      },
    });

    // 3.3. Tabungan
    const tabTabungan = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.KONVENSIONAL,
        nama: "Tabungan",
        slug: "tabungan",
        urutan: 3,
        deskripsi: "Suku bunga simpanan tabungan perorangan dan non-perorangan berjenjang (tiering).",
        barisRates: {
          create: [
            {
              namaProduk: "Tabungan Utama Perorangan",
              tenorTiering: "Saldo < Rp 1.000.000",
              ratePersen: "0.00% p.a.",
              saldoMinimal: "Setoran awal Rp 100.000",
              keterangan: "Saldo mengendap Rp 50.000",
              urutan: 1,
            },
            {
              namaProduk: "Tabungan Utama Perorangan",
              tenorTiering: "Saldo Rp 1 Jt s.d < Rp 50 Jt",
              ratePersen: "0.75% p.a.",
              saldoMinimal: "Bunga harian akumulasi bulanan",
              keterangan: "Bebas biaya admin dengan saldo > Rp 5 Jt",
              urutan: 2,
            },
            {
              namaProduk: "Tabungan Bisnis Prima",
              tenorTiering: "Saldo Rp 50 Jt s.d < Rp 500 Jt",
              ratePersen: "1.75% p.a.",
              saldoMinimal: "Setoran awal Rp 1.000.000",
              keterangan: "Gratis transfer LLG & BI-Fast 25x/bln",
              urutan: 3,
            },
            {
              namaProduk: "Tabungan Bisnis Prima",
              tenorTiering: "Saldo >= Rp 500 Juta",
              ratePersen: "2.75% p.a.",
              saldoMinimal: "Khusus nasabah badan / pengusaha",
              keterangan: "Layanan prioritas & Relationship Manager",
              urutan: 4,
            },
          ],
        },
      },
    });

    // 3.4. Deposito
    const tabDeposito = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.KONVENSIONAL,
        nama: "Deposito",
        slug: "deposito",
        urutan: 4,
        deskripsi: "Suku bunga simpanan berjangka Rupiah sesuai keputusan rapat komite ALCO.",
        barisRates: {
          create: [
            {
              namaProduk: "Deposito Berjangka IDR (Counter)",
              tenorTiering: "1 Bulan",
              ratePersen: "4.50% p.a.",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "ARO Pokok / ARO Pokok + Bunga",
              urutan: 1,
            },
            {
              namaProduk: "Deposito Berjangka IDR (Counter)",
              tenorTiering: "3 Bulan",
              ratePersen: "5.00% p.a.",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "Dapat dijadikan agunan kredit (back-to-back)",
              urutan: 2,
            },
            {
              namaProduk: "Deposito Berjangka IDR (Counter)",
              tenorTiering: "6 Bulan",
              ratePersen: "5.25% p.a.",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "Penarikan sebelum jatuh tempo dikenakan penalti",
              urutan: 3,
            },
            {
              namaProduk: "Deposito Berjangka IDR (Counter)",
              tenorTiering: "12 Bulan",
              ratePersen: "5.50% p.a.",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "Tarif tertinggi di bawah batas penjaminan LPS",
              urutan: 4,
            },
            {
              namaProduk: "Special Rate Deposito ALCO",
              tenorTiering: "3 & 6 Bulan",
              ratePersen: "5.75% p.a.",
              saldoMinimal: "Min. Rp 1.000.000.000 (>= 1 M)",
              keterangan: "Wajib persetujuan tertulis Ketua ALCO",
              urutan: 5,
            },
          ],
        },
      },
    });

    // 3.5. Giro
    const tabGiro = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.KONVENSIONAL,
        nama: "Giro",
        slug: "giro",
        urutan: 5,
        deskripsi: "Jasa giro simpanan transaksi operasional korporasi dan institusi.",
        barisRates: {
          create: [
            {
              namaProduk: "Giro Rupiah Perorangan",
              tenorTiering: "Saldo < Rp 100 Juta",
              ratePersen: "1.00% p.a.",
              saldoMinimal: "Setoran awal Rp 1.000.000",
              keterangan: "Buku cek & bilyet giro",
              urutan: 1,
            },
            {
              namaProduk: "Giro Rupiah Korporasi",
              tenorTiering: "Saldo Rp 100 Jt s.d < Rp 1 M",
              ratePersen: "1.75% p.a.",
              saldoMinimal: "Setoran awal Rp 5.000.000",
              keterangan: "Dukungan integrasi Corporate Internet Banking",
              urutan: 2,
            },
            {
              namaProduk: "Giro Rupiah Korporasi Utama",
              tenorTiering: "Saldo >= Rp 1 Miliar",
              ratePersen: "2.50% p.a.",
              saldoMinimal: "Penyelesaian transaksi real-time",
              keterangan: "Dilengkapi layanan sweeping saldo otomatis",
              urutan: 3,
            },
          ],
        },
      },
    });

    // 3.6. Syariah (Bagi Hasil / Nisbah) - Default Sub-Tabs
    const tabSyariahPembiayaan = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.SYARIAH,
        nama: "Pembiayaan Produktif",
        slug: "pembiayaan-produktif-syariah",
        urutan: 1,
        deskripsi: "Margin murabahah dan nisbah bagi hasil musyarakah/mudharabah sektor riil.",
        barisRates: {
          create: [
            {
              namaProduk: "Pembiayaan Modal Kerja Murabahah",
              tenorTiering: "1 - 3 Tahun",
              ratePersen: "Margin Eq. 9.00% p.a.",
              saldoMinimal: "Plafon min Rp 200 Juta",
              keterangan: "Akad jual beli dengan kepastian angsuran",
              urutan: 1,
            },
            {
              namaProduk: "Pembiayaan Modal Kerja Musyarakah",
              tenorTiering: "1 Tahun (Review berkala)",
              ratePersen: "Nisbah Nasabah:Bank = 45 : 55",
              saldoMinimal: "Plafon min Rp 500 Juta",
              keterangan: "Bagi hasil riil berdasarkan pendapatan usaha",
              urutan: 2,
            },
          ],
        },
      },
    });

    const tabSyariahSimpanan = await prisma.subTabProduk.create({
      data: {
        tipe: TipeSukuBunga.SYARIAH,
        nama: "Tabungan & Deposito Syariah",
        slug: "tabungan-deposito-syariah",
        urutan: 2,
        deskripsi: "Nisbah bagi hasil simpanan mudharabah dan bonus tabungan wadiah.",
        barisRates: {
          create: [
            {
              namaProduk: "Tabungan Mudharabah Barakah",
              tenorTiering: "Bulanan (Tiering Saldo > Rp 10 Jt)",
              ratePersen: "Nisbah 22 : 78 (Eq. 2.45%)",
              saldoMinimal: "Min. Rp 100.000",
              keterangan: "Bebas biaya administrasi bulanan",
              urutan: 1,
            },
            {
              namaProduk: "Deposito Mudharabah 1 Bulan",
              tenorTiering: "1 Bulan",
              ratePersen: "Nisbah 42 : 58 (Eq. 4.60%)",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "Investasi terikat akad Mudharabah Muthlaqah",
              urutan: 2,
            },
            {
              namaProduk: "Deposito Mudharabah 3 Bulan",
              tenorTiering: "3 Bulan",
              ratePersen: "Nisbah 46 : 54 (Eq. 5.10%)",
              saldoMinimal: "Min. Rp 10.000.000",
              keterangan: "Pilihan bagi hasil ditransfer atau rollover",
              urutan: 3,
            },
          ],
        },
      },
    });

    console.log("SubTabProduk & Suku Bunga seeded successfully.");
  }

  console.log("Database seed completed!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
