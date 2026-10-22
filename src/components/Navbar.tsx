"use client";

import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Landmark, Shield, User, LogIn, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    setDropdownOpen(false);
    await signIn("credentials", {
      email,
      password: email.includes("admin") ? "admin123" : "karyawan123",
      redirect: false,
    });
    setSwitching(false);
    window.location.reload();
  };

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ALCO Portal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Bank Intranet
                </span>
              </div>
              <p className="text-xs text-slate-500">Papan Keputusan Rapat & Suku Bunga Resmi</p>
            </div>
          </div>

          {/* Right Section: User & Auth */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                    isAdmin ? "bg-indigo-600" : "bg-sky-600"
                  }`}>
                    {session.user.name?.[0] || "U"}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 leading-none">{session.user.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isAdmin
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {isAdmin ? "Admin" : "Karyawan"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {session.user.department || "Internal Staff"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Sedang login sebagai</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{session.user.email}</p>
                      <p className="text-xs text-blue-600 font-medium capitalize mt-0.5">
                        Hak Akses: {session.user.role} ({isAdmin ? "Manajemen / CRUD" : "Read-Only"})
                      </p>
                    </div>

                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Ganti Akun Cepat (Demo)
                      </p>
                      <button
                        onClick={() => handleQuickSwitch("admin@company.com")}
                        disabled={switching || session.user.email === "admin@company.com"}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span>Admin (Manajemen ALCO)</span>
                        </div>
                        {session.user.email === "admin@company.com" && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </button>
                      <button
                        onClick={() => handleQuickSwitch("karyawan@company.com")}
                        disabled={switching || session.user.email === "karyawan@company.com"}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>Karyawan (Staf Cabang)</span>
                        </div>
                        {session.user.email === "karyawan@company.com" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Keluar Sesi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickSwitch("admin@company.com")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" /> Masuk Admin
                </button>
                <button
                  onClick={() => handleQuickSwitch("karyawan@company.com")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> Masuk Karyawan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
