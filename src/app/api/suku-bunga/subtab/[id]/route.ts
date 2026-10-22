import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat menghapus sub-tab" },
        { status: 403 }
      );
    }

    await prisma.subTabProduk.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sub-tab dan seluruh baris produknya berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/suku-bunga/subtab/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus sub-tab" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat memperbarui sub-tab" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nama, deskripsi } = body;

    const updated = await prisma.subTabProduk.update({
      where: { id },
      data: {
        ...(nama ? { nama: nama.trim() } : {}),
        ...(deskripsi !== undefined ? { deskripsi: deskripsi?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ message: "Sub-tab berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("PUT /api/suku-bunga/subtab/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui sub-tab" }, { status: 500 });
  }
}
