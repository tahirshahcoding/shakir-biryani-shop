import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession } from "@/lib/errors/api-handler";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { changePassword } from "@/modules/auth/auth.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const validated = changePasswordSchema.parse(body);

  await changePassword(session.userId, validated.currentPassword, validated.newPassword);

  return NextResponse.json({ success: true, message: "Password changed successfully" });
});
