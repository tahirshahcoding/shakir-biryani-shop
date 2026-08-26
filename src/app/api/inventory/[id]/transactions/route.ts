import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/modules/inventory/inventory.service";
import { getSession } from "@/modules/auth/auth.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(_request.url);

    const result = await getTransactions(id, {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      type: searchParams.get("type") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 25,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/inventory/[id]/transactions error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
