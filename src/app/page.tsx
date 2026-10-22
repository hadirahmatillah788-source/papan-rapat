"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { SukuBungaPanel } from "@/components/SukuBungaPanel";
import { ModalFormRapat } from "@/components/ModalFormRapat";
import { ModalDetailRapat } from "@/components/ModalDetailRapat";
import { GoogleDriveViewerModal } from "@/components/GoogleDriveViewerModal";
import {
  Search,
  Plus,
  Calendar,
  FileText,
  Filter,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Table,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  History,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Dashboard Main Tabs: "rapat" vs "suku-bunga"
  const [activeMainTab, setActiveMainTab] = useState<"rapat" | "suku-bunga">("rapat");

  // Rapat state: Filter Aktif vs Non-Aktif ("aktif" | "non-aktif" | "semua")
  const [filterAktif, setFilterAktif] = useState<"aktif" | "non-aktif" | "semua">("aktif");
  const [rapatList, setRapatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any | null>(null);
  const [detailModalRapat, setDetailModalRapat] = useState<any | null>(null);
  const [quickDriveDoc, setQuickDriveDoc] = useState<any | null>(null);

  // Fetch Pengumuman
  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedKategori && selectedKategori !== "Semua") params.set("kategori", selectedKategori);
      if (isAdmin && selectedStatus !== "ALL") params.set("status", selectedStatus);

      // Handle active / inactive decision filter
      if (filterAktif === "aktif") {
        params.set("isAktif", "true");
      } else if (filterAktif === "non-aktif") {
        params.set("isAktif", "false");
      }

      const res = await fetch(`/api/pengumuman?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setRapatList(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching pengumuman:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, [searchQuery, selectedKategori, selectedStatus, filterAktif, isAdmin]);

  // Handle Delete Rapat
  const handleDeleteRapat = async (id: string, judul: string) => {
    if (!confirm(`Hapus risalah "${judul}" beserta lampirannya?`)) return;
    try {
      const res = await fetch(`/api/pengumuman/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPengumuman();
      } else {
        alert("Gagal menghapus risalah rapat");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  // Quick toggle active / inactive for Admin
  const handleToggleAktif = async (rapat: any) => {
    const nextAktif = !rapat.isAktif;
    const actionLabel = nextAktif
      ? "mengaktifkan kembali keputusan ini?"
      : "menandai keputusan ini sebagai NON-AKTIF (telah diperbarui)?";

    let catatan = rapat.keteranganStatus || "";
    if (!nextAktif) {
      const inputCatatan = prompt(
        "Keterangan pembaruan (misal: Telah diperbarui oleh Risalah ALCO No. 014/X/2026):",
        catatan || "Telah diperbarui oleh keputusan rapat terbaru."
      );
      if (inputCatatan === null) return; // Cancelled
      catatan = inputCatatan;
    }

    if (!confirm(`Apakah Anda yakin ingin ${actionLabel}`)) return;

    try {
      const res = await fetch(`/api/pengumuman/${rapat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAktif: nextAktif,
          keteranganStatus: nextAktif ? null : catatan,
        }),
      });

      if (res.ok) {
        fetchPengumuman();
      } else {
        alert("Gagal memperbarui status masa berlaku");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengubah status");
    }
  };

  const handleEditRapat = (rapat: any) => {
    setFormInitialData(rapat);
    setIsFormModalOpen(true);
  };

  const handleCreateNew = () => {
    setFormInitialData(null);
    setIsFormModalOpen(true);
  };

  const kategoriOptions = [
    "Semua",
    "ALCO / Treasury",
    "Manajemen",
    "Operasional",
    "Kredit & Risiko",
    "HR / SDM",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-3">
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              Sistem Informasi Manajemen ALCO & Perbankan
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Portal Keputusan Rapat & Publikasi Suku Bunga Resmi
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Pusat penelusuran keputusan rapat komite ALCO aktif dan riwayat keputusan terdahulu (non-aktif), dilengkapi publikasi suku bunga konvensional serta bagi hasil syariah secara terpadu.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Main Navigation Tabs: Rapat vs Suku Bunga */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveMainTab("rapat")}
            className={`pb-3.5 px-3 sm:px-5 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap ${
              activeMainTab === "rapat"
                ? "border-blue-600 text-blue-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Risalah & Keputusan Rapat ALCO
          </button>

          <button
            onClick={() => setActiveMainTab("suku-bunga")}
            className={`pb-3.5 px-3 sm:px-5 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap ${
              activeMainTab === "suku-bunga"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Suku Bunga (Konven) & Bagi Hasil (Syariah)
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Rates
            </span>
          </button>
        </div>

        {/* TAB 1: RISALAH RAPAT */}
        {activeMainTab === "rapat" && (
          <div className="space-y-5">
            {/* Sub-Tab Khusus: Keputusan Aktif vs Non-Aktif (Riwayat) */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setFilterAktif("aktif")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterAktif === "aktif"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Keputusan Aktif (Sedang Berlaku)
                </button>

                <button
                  onClick={() => setFilterAktif("non-aktif")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterAktif === "non-aktif"
                      ? "bg-white text-amber-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  Keputusan Non-Aktif (Telah Diperbarui)
                </button>

                <button
                  onClick={() => setFilterAktif("semua")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterAktif === "semua"
                      ? "bg-white text-slate-800 shadow-xs border border-slate-200 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Semua
                </button>
              </div>

              <div className="text-xs text-slate-500 pr-3 font-medium">
                Menampilkan: <strong>{rapatList.length}</strong> dokumen{" "}
                {filterAktif === "aktif"
                  ? "berstatus aktif"
                  : filterAktif === "non-aktif"
                  ? "berstatus non-aktif/riwayat"
                  : "seluruhnya"}
              </div>
            </div>

            {/* Filter & Action Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari risalah, nomor BA, atau kata kunci keputusan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters & Admin Action */}
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto justify-end">
                {/* Category Dropdown */}
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k}>
                      {k === "Semua" ? "Semua Kategori" : k}
                    </option>
                  ))}
                </select>

                {/* Status Dropdown (Admin Only) */}
                {isAdmin && (
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-purple-200 bg-purple-50 text-purple-800 font-semibold focus:outline-none"
                  >
                    <option value="ALL">Semua Draft/Publish</option>
                    <option value="PUBLISHED">Published Saja</option>
                    <option value="DRAFT">Draft Saja</option>
                  </select>
                )}

                {/* Create Button (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" /> + Buat Risalah Rapat
                  </button>
                )}
              </div>
            </div>

            {/* List / Cards of Meetings */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : rapatList.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">
                  Tidak ada keputusan {filterAktif === "aktif" ? "aktif" : filterAktif === "non-aktif" ? "non-aktif" : ""} yang ditemukan
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Coba ubah filter masa berlaku di atas atau bersihkan kata kunci pencarian Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {rapatList.map((rapat) => {
                  const hasTable = rapat.isiKeputusan.includes("|") && rapat.isiKeputusan.includes("---");
                  const hasDriveLinks = Array.isArray(rapat.lampiran) && rapat.lampiran.length > 0;
                  const isAktif = rapat.isAktif !== false;
                  const dateStr = new Date(rapat.tanggalRapat).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={rapat.id}
                      className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                        isAktif
                          ? "bg-white border-slate-200 hover:border-blue-400"
                          : "bg-amber-50/20 border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Badges: Kategori, Nomor, Status Aktif / Non-Aktif, Status Publish */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {rapat.kategori}
                            </span>
                            {rapat.nomorRapat && (
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {rapat.nomorRapat}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Active vs Inactive Badge */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 ${
                                isAktif
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {isAktif ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Keputusan Aktif
                                </>
                              ) : (
                                <>
                                  <History className="w-3 h-3 text-amber-700" />
                                  Non-Aktif (Diperbarui)
                                </>
                              )}
                            </span>

                            {/* Publish Status */}
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                rapat.status === "PUBLISHED"
                                  ? "bg-slate-100 text-slate-600 border border-slate-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {rapat.status}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {rapat.judul}
                        </h3>

                        {/* Summary or Inactive notice */}
                        {!isAktif && rapat.keteranganStatus ? (
                          <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 font-medium">
                              <strong>Status:</strong> {rapat.keteranganStatus}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {rapat.ringkasan || "Klik tombol di bawah untuk melihat rincian pembahasan dan matriks keputusan rapat."}
                          </p>
                        )}

                        {/* Badges Features: Table & Drive */}
                        <div className="flex items-center gap-2 pt-1">
                          {hasTable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              <Table className="w-3 h-3 text-indigo-600" /> Berisi Tabel Matriks
                            </span>
                          )}
                          {hasDriveLinks && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <FileText className="w-3 h-3 text-emerald-600" /> {rapat.lampiran.length} Lampiran (Drive)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick Drive preview button if exists */}
                          {hasDriveLinks && (
                            <button
                              onClick={() => setQuickDriveDoc(rapat.lampiran[0])}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                              title="Buka lampiran Google Drive (View-Only)"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" /> Lampiran
                            </button>
                          )}

                          <button
                            onClick={() => setDetailModalRapat(rapat)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            Buka Risalah <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Admin Actions: Toggle Aktif, Edit, Delete */}
                          {isAdmin && (
                            <div className="flex items-center pl-1 border-l border-slate-200 gap-1">
                              <button
                                onClick={() => handleToggleAktif(rapat)}
                                className={`p-1.5 rounded-lg text-xs transition-colors ${
                                  isAktif
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={isAktif ? "Tandai sebagai Non-Aktif (Telah Diperbarui)" : "Aktifkan kembali keputusan ini"}
                              >
                                {isAktif ? <History className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleEditRapat(rapat)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit risalah rapat"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRapat(rapat.id, rapat.judul)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus risalah rapat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUKU BUNGA & BAGI HASIL */}
        {activeMainTab === "suku-bunga" && <SukuBungaPanel />}
      </main>

      {/* Modals */}
      <ModalFormRapat
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchPengumuman}
        initialData={formInitialData}
      />

      <ModalDetailRapat
        isOpen={!!detailModalRapat}
        onClose={() => setDetailModalRapat(null)}
        rapat={detailModalRapat}
      />

      {quickDriveDoc && (
        <GoogleDriveViewerModal
          isOpen={!!quickDriveDoc}
          onClose={() => setQuickDriveDoc(null)}
          documentTitle={quickDriveDoc.namaFile}
          previewUrl={quickDriveDoc.fileUrl}
          keterangan={quickDriveDoc.keterangan}
        />
      )}
    </div>
  );
}
