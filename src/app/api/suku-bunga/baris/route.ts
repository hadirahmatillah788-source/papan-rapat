import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

// POST /api/suku-bunga/baris - Add new rate row (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat menambah baris suku bunga" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subTabId, namaProduk, tenorTiering, ratePersen, saldoMinimal, keterangan } = body;

    if (!subTabId || !namaProduk || !tenorTiering || !ratePersen) {
      return NextResponse.json(
        { error: "Sub-tab, nama produk, tenor/tiering, dan suku bunga/nisbah wajib diisi" },
        { status: 400 }
      );
    }

    const maxUrutan = await prisma.barisSukuBunga.findFirst({
      where: { subTabId },
      orderBy: { urutan: "desc" },
      select: { urutan: true },
    });

    const newRow = await prisma.barisSukuBunga.create({
      data: {
        subTabId,
        namaProduk: namaProduk.trim(),
        tenorTiering: tenorTiering.trim(),
        ratePersen: ratePersen.trim(),
        saldoMinimal: saldoMinimal?.trim() || null,
        keterangan: keterangan?.trim() || null,
        urutan: (maxUrutan?.urutan ?? 0) + 1,
      },
    });

    return NextResponse.json({ message: "Baris suku bunga berhasil ditambahkan", data: newRow }, { status: 201 });
  } catch (error) {
    console.error("POST /api/suku-bunga/baris error:", error);
    return NextResponse.json({ error: "Gagal menambahkan baris suku bunga" }, { status: 500 });
  }
}
