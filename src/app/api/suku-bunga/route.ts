import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role, TipeSukuBunga } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/suku-bunga - Fetch sub-tabs and rate rows
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipeParam = searchParams.get("tipe"); // "KONVENSIONAL" | "SYARIAH" | all

    const whereClause: any = {};
    if (tipeParam && Object.values(TipeSukuBunga).includes(tipeParam as TipeSukuBunga)) {
      whereClause.tipe = tipeParam as TipeSukuBunga;
    }

    const subTabs = await prisma.subTabProduk.findMany({
      where: whereClause,
      include: {
        barisRates: {
          orderBy: { urutan: "asc" },
        },
      },
      orderBy: [{ tipe: "asc" }, { urutan: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: subTabs });
  } catch (error) {
    console.error("GET /api/suku-bunga error:", error);
    return NextResponse.json({ error: "Gagal mengambil data suku bunga" }, { status: 500 });
  }
}
