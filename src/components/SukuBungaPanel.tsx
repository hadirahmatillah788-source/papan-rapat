"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Percent,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Landmark,
} from "lucide-react";

interface BarisRate {
  id: string;
  namaProduk: string;
  tenorTiering: string;
  ratePersen: string;
  saldoMinimal?: string | null;
  keterangan?: string | null;
  tanggalBerlaku: string;
  urutan: number;
}

interface SubTab {
  id: string;
  tipe: "KONVENSIONAL" | "SYARIAH";
  nama: string;
  slug: string;
  urutan: number;
  deskripsi?: string | null;
  barisRates: BarisRate[];
}

export function SukuBungaPanel() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [mainType, setMainType] = useState<"KONVENSIONAL" | "SYARIAH">("KONVENSIONAL");
  const [subTabs, setSubTabs] = useState<SubTab[]>([]);
  const [activeSubTabId, setActiveSubTabId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isAddSubTabOpen, setIsAddSubTabOpen] = useState(false);
  const [newSubTabNama, setNewSubTabNama] = useState("");
  const [newSubTabDeskripsi, setNewSubTabDeskripsi] = useState("");

  // Add / Edit Row Modal state
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BarisRate | null>(null);
  const [rowNamaProduk, setRowNamaProduk] = useState("");
  const [rowTenorTiering, setRowTenorTiering] = useState("");
  const [rowRatePersen, setRowRatePersen] = useState("");
  const [rowSaldoMinimal, setRowSaldoMinimal] = useState("");
  const [rowKeterangan, setRowKeterangan] = useState("");
  const [submittingRow, setSubmittingRow] = useState(false);

  // Fetch rates
  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/suku-bunga");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data suku bunga");

      const allData: SubTab[] = json.data || [];
      setSubTabs(allData);

      // Set active sub-tab for current mainType if not set or invalid
      const currentTypeTabs = allData.filter((t) => t.tipe === mainType);
      if (currentTypeTabs.length > 0) {
        const stillValid = currentTypeTabs.find((t) => t.id === activeSubTabId);
        if (!stillValid) {
          setActiveSubTabId(currentTypeTabs[0].id);
        }
      } else {
        setActiveSubTabId("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat suku bunga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // When mainType changes, switch to first subtab of that type
  useEffect(() => {
    const filtered = subTabs.filter((t) => t.tipe === mainType);
    if (filtered.length > 0) {
      setActiveSubTabId(filtered[0].id);
    } else {
      setActiveSubTabId("");
    }
  }, [mainType, subTabs]);

  const currentSubTabs = subTabs.filter((t) => t.tipe === mainType);
  const activeSubTab = subTabs.find((t) => t.id === activeSubTabId);

  // Handler: Add new sub-tab
  const handleCreateSubTab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTabNama.trim()) return;

    try {
      const res = await fetch("/api/suku-bunga/subtab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe: mainType,
          nama: newSubTabNama.trim(),
          deskripsi: newSubTabDeskripsi.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat sub-tab baru");

      setNewSubTabNama("");
      setNewSubTabDeskripsi("");
      setIsAddSubTabOpen(false);
      await fetchRates();
      if (json.data?.id) setActiveSubTabId(json.data.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Delete sub-tab
  const handleDeleteSubTab = async (subTabId: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sub-tab "${nama}" beserta seluruh data suku bunganya?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/suku-bunga/subtab/${subTabId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus sub-tab");
      await fetchRates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Open modal for Add Row
  const handleOpenAddRow = () => {
    setEditingRow(null);
    setRowNamaProduk("");
    setRowTenorTiering("");
    setRowRatePersen(mainType === "SYARIAH" ? "Nisbah 45 : 55 (Eq. 5.00%)" : "5.00% p.a.");
    setRowSaldoMinimal("");
    setRowKeterangan("");
    setIsRowModalOpen(true);
  };

  // Handler: Open modal for Edit Row
  const handleOpenEditRow = (row: BarisRate) => {
    setEditingRow(row);
    setRowNamaProduk(row.namaProduk);
    setRowTenorTiering(row.tenorTiering);
    setRowRatePersen(row.ratePersen);
    setRowSaldoMinimal(row.saldoMinimal || "");
    setRowKeterangan(row.keterangan || "");
    setIsRowModalOpen(true);
  };

  // Handler: Save Row (Create or Update)
  const handleSaveRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rowNamaProduk.trim() || !rowTenorTiering.trim() || !rowRatePersen.trim()) {
      alert("Nama produk, tenor/tiering, dan suku bunga/nisbah wajib diisi");
      return;
    }

    setSubmittingRow(true);
    try {
      if (editingRow) {
        // Update
        const res = await fetch(`/api/suku-bunga/baris/${editingRow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaProduk: rowNamaProduk.trim(),
            tenorTiering: rowTenorTiering.trim(),
            ratePersen: rowRatePersen.trim(),
            saldoMinimal: rowSaldoMinimal.trim() || null,
            keterangan: rowKeterangan.trim() || null,
          }),
        });
        if (!res.ok) throw new Error("Gagal memperbarui suku bunga");
      } else {
        // Create
        const res = await fetch(`/api/suku-bunga/baris`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subTabId: activeSubTabId,
            namaProduk: rowNamaProduk.trim(),
            tenorTiering: rowTenorTiering.trim(),
            ratePersen: rowRatePersen.trim(),
            saldoMinimal: rowSaldoMinimal.trim() || null,
            keterangan: rowKeterangan.trim() || null,
          }),
        });
        if (!res.ok) throw new Error("Gagal menambahkan suku bunga");
      }

      setIsRowModalOpen(false);
      await fetchRates();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRow(false);
    }
  };

  // Handler: Delete Row
  const handleDeleteRow = async (rowId: string, nama: string) => {
    if (!confirm(`Hapus baris produk "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/suku-bunga/baris/${rowId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus baris");
      await fetchRates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Switcher: Konvensional vs Syariah */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setMainType("KONVENSIONAL")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mainType === "KONVENSIONAL"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Suku Bunga (Konvensional)
          </button>
          <button
            onClick={() => setMainType("SYARIAH")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mainType === "SYARIAH"
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-600" />
            Bagi Hasil & Nisbah (Syariah)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Berlaku Efektif Keputusan Rapat ALCO Terakhir</span>
        </div>
      </div>

      {/* Sub-Tabs Bar (Flexible & Dynamic) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Kategori Produk {mainType === "KONVENSIONAL" ? "Konvensional" : "Syariah"}:
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddSubTabOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Sub-Tab Baru
            </button>
          )}
        </div>

        {/* Scrollable Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1">
          {currentSubTabs.map((subTab) => {
            const isActive = subTab.id === activeSubTabId;
            return (
              <div key={subTab.id} className="relative group shrink-0">
                <button
                  onClick={() => setActiveSubTabId(subTab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? mainType === "KONVENSIONAL"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{subTab.nama}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {subTab.barisRates.length}
                  </span>
                </button>

                {isAdmin && currentSubTabs.length > 1 && (
                  <button
                    onClick={() => handleDeleteSubTab(subTab.id, subTab.nama)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                    title="Hapus sub-tab"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {currentSubTabs.length === 0 && (
            <p className="text-xs text-slate-400 py-2">Belum ada sub-tab untuk kategori ini.</p>
          )}
        </div>
      </div>

      {/* Active Sub-Tab Table & Controls */}
      {activeSubTab && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header & Actions */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Tabel Tarif: {activeSubTab.nama}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                  {mainType === "KONVENSIONAL" ? "Suku Bunga" : "Bagi Hasil"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSubTab.deskripsi ||
                  "Tarif acuan resmi berdasarkan hasil keputusan rapat komite ALCO."}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddRow}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> + Tambah Baris Suku Bunga
              </button>
            )}
          </div>

          {/* Rate Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Produk</th>
                  <th className="py-3.5 px-4">Tenor / Tiering Saldo</th>
                  <th className="py-3.5 px-4">
                    {mainType === "KONVENSIONAL" ? "Suku Bunga (% p.a.)" : "Nisbah / Bagi Hasil (Eq.)"}
                  </th>
                  <th className="py-3.5 px-4">Saldo Min. / Ketentuan</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center w-28">Aksi (Admin)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-normal">
                {activeSubTab.barisRates.map((row, index) => (
                  <tr
                    key={row.id}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-sky-50/50 transition-colors"
                        : "bg-slate-50/50 hover:bg-sky-50/50 transition-colors"
                    }
                  >
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.namaProduk}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {row.tenorTiering}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                          mainType === "KONVENSIONAL"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {row.ratePersen}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{row.saldoMinimal || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-500">{row.keterangan || "-"}</td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditRow(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit baris tarif"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row.id, row.namaProduk)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus baris tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {activeSubTab.barisRates.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      Belum ada data suku bunga pada sub-tab ini.
                      {isAdmin && " Klik '+ Tambah Baris Suku Bunga' untuk menambahkan produk pertama."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah Sub-Tab Baru (Khusus Admin) */}
      {isAddSubTabOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Tambah Sub-Tab Produk Baru ({mainType})
              </h3>
              <button
                onClick={() => setIsAddSubTabOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubTab} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Sub-Tab Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kredit Korporasi / Sukuk Ritel"
                  value={newSubTabNama}
                  onChange={(e) => setNewSubTabNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan singkat kelompok produk"
                  value={newSubTabDeskripsi}
                  onChange={(e) => setNewSubTabDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubTabOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Simpan Sub-Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Baris Suku Bunga (Khusus Admin) */}
      {isRowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                {editingRow ? "Edit Baris Suku Bunga" : "Tambah Baris Suku Bunga"} ({activeSubTab?.nama})
              </h3>
              <button
                onClick={() => setIsRowModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRow} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Deposito Berjangka IDR / KPR Primary"
                  value={rowNamaProduk}
                  onChange={(e) => setRowNamaProduk(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tenor / Tiering *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 Bulan / > Rp 500 Juta"
                    value={rowTenorTiering}
                    onChange={(e) => setRowTenorTiering(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {mainType === "KONVENSIONAL" ? "Suku Bunga * (% p.a.)" : "Nisbah / Bagi Hasil *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 4.50% p.a. atau 60 : 40"
                    value={rowRatePersen}
                    onChange={(e) => setRowRatePersen(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Saldo Minimal / Ketentuan Nominal
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Min. Rp 10.000.000 / Bebas biaya admin"
                  value={rowSaldoMinimal}
                  onChange={(e) => setRowSaldoMinimal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan & Catatan Khusus
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Khusus dana segar / Review Komite ALCO"
                  value={rowKeterangan}
                  onChange={(e) => setRowKeterangan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRowModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingRow}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  {submittingRow ? "Menyimpan..." : "Simpan Suku Bunga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
