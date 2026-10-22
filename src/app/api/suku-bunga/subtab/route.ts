import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role, TipeSukuBunga } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat menambah sub-tab produk" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tipe, nama, deskripsi } = body;

    if (!nama || !tipe) {
      return NextResponse.json({ error: "Nama sub-tab dan tipe (Konven/Syariah) wajib diisi" }, { status: 400 });
    }

    const cleanTipe = tipe === "SYARIAH" ? TipeSukuBunga.SYARIAH : TipeSukuBunga.KONVENSIONAL;
    const slug = nama
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if sub-tab with same slug exists for this tipe
    const existing = await prisma.subTabProduk.findUnique({
      where: {
        tipe_slug: {
          tipe: cleanTipe,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Sub-tab "${nama}" sudah ada dalam kategori ini` }, { status: 400 });
    }

    // Get max urutan
    const maxUrutan = await prisma.subTabProduk.findFirst({
      where: { tipe: cleanTipe },
      orderBy: { urutan: "desc" },
      select: { urutan: true },
    });

    const newSubTab = await prisma.subTabProduk.create({
      data: {
        tipe: cleanTipe,
        nama: nama.trim(),
        slug,
        deskripsi: deskripsi?.trim() || null,
        urutan: (maxUrutan?.urutan ?? 0) + 1,
      },
      include: {
        barisRates: true,
      },
    });

    return NextResponse.json({ message: "Sub-tab baru berhasil ditambahkan", data: newSubTab }, { status: 201 });
  } catch (error) {
    console.error("POST /api/suku-bunga/subtab error:", error);
    return NextResponse.json({ error: "Gagal membuat sub-tab produk" }, { status: 500 });
  }
}
