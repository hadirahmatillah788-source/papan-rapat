"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Landmark,
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random Captcha string
  const generateCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Draw Captcha on Canvas with security distortions & noise lines
  useEffect(() => {
    if (!canvasRef.current || !captchaCode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f1f5f9");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(
        Math.random() * 100
      )}, ${Math.floor(Math.random() * 200)}, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(100, 116, 139, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with random rotation and colors
    ctx.font = "bold 24px monospace";
    ctx.textBaseline = "middle";

    const colors = ["#1e3a8a", "#1e40af", "#0369a1", "#0f766e", "#3730a3"];

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      const x = 20 + i * 24;
      const y = canvas.height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 20 - 10) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate Captcha
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Kode Captcha yang Anda masukkan salah. Silakan coba lagi.");
      generateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau kata sandi yang Anda masukkan salah");
        generateCaptcha();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat masuk");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setCaptchaInput(captchaCode); // Auto-fill matching captcha for seamless testing
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: quickEmail,
        password: quickPass,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        generateCaptcha();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal melakukan login cepat");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-5 bg-gradient-to-b from-slate-50 to-white text-center border-b border-slate-100">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ALCO Portal Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Papan Keputusan Rapat Komite & Publikasi Suku Bunga Resmi
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-5 space-y-4">
          {/* Inactivity Notification */}
          {reason === "inactivity" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sesi Anda Telah Berakhir</p>
                <p className="mt-0.5 text-amber-800">
                  Demi keamanan perbankan, sesi Anda otomatis dikeluarkan karena tidak ada aktivitas selama 15 menit.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Captcha Security Verification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Verifikasi Keamanan (Captcha)
                </label>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  title="Ganti kode Captcha"
                >
                  <RefreshCw className="w-3 h-3" /> Ganti Kode
                </button>
              </div>

              <div className="flex items-center gap-2">
                <canvas
                  ref={canvasRef}
                  width={150}
                  height={42}
                  className="rounded-lg border border-slate-300 bg-slate-100 shadow-2xs select-none"
                />
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="KODE"
                  className="flex-1 px-3 py-2 text-center tracking-widest font-mono font-bold text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Switchers */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Akses Cepat Pengujian (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@company.com", "admin123")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" /> Admin ALCO
                </div>
                <p className="text-[10px] text-purple-600 mt-0.5">Hak Cipta & Edit Penuh</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("karyawan@company.com", "karyawan123")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <User className="w-3.5 h-3.5" /> Karyawan
                </div>
                <p className="text-[10px] text-emerald-600 mt-0.5">Akses Hanya-Baca</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Dilindungi proteksi auto-logout dan enkripsi sesi berstandar perbankan.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginForm />
    </Suspense>
  );
}
