import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const roles = await db.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error("GET /api/roles error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
