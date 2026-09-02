import { NextResponse } from "next/server";
import { getActiveSession } from "@/modules/auth/auth.service";

export async function GET() {
  const session = await getActiveSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, data: { user: session } });
}
