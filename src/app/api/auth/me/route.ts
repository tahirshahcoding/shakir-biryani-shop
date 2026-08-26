import { NextResponse } from "next/server";
import { getSession } from "@/modules/auth/auth.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, data: { user: session } });
}
