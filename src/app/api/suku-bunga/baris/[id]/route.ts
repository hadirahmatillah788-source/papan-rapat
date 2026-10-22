import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/suku-bunga/baris/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat mengubah suku bunga" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { namaProduk, tenorTiering, ratePersen, saldoMinimal, keterangan } = body;

    const updated = await prisma.barisSukuBunga.update({
      where: { id },
      data: {
        ...(namaProduk ? { namaProduk: namaProduk.trim() } : {}),
        ...(tenorTiering ? { tenorTiering: tenorTiering.trim() } : {}),
        ...(ratePersen ? { ratePersen: ratePersen.trim() } : {}),
        ...(saldoMinimal !== undefined ? { saldoMinimal: saldoMinimal?.trim() || null } : {}),
        ...(keterangan !== undefined ? { keterangan: keterangan?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ message: "Baris suku bunga berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("PUT /api/suku-bunga/baris/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui suku bunga" }, { status: 500 });
  }
}

// DELETE /api/suku-bunga/baris/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat menghapus suku bunga" },
        { status: 403 }
      );
    }

    await prisma.barisSukuBunga.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Baris suku bunga berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/suku-bunga/baris/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus baris suku bunga" }, { status: 500 });
  }
}
