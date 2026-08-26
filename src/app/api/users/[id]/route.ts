import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { updateUserSchema } from "@/lib/validation/schemas";
import bcrypt from "bcryptjs";
import * as userRepo from "@/modules/users/user.repository";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  await requireSession();
  const { id } = await params;
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError("User");
  return NextResponse.json({ success: true, data: user });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "USERS_MANAGE");
  const { id } = await params;
  const body = await request.json();
  const validated = updateUserSchema.parse(body);

  const data: Record<string, unknown> = {};
  if (validated.name) data.name = validated.name;
  if (validated.email) data.email = validated.email;
  if (validated.roleId) data.roleId = validated.roleId;
  if (typeof validated.isActive === "boolean") data.isActive = validated.isActive;
  if (validated.password) data.passwordHash = await bcrypt.hash(validated.password, 12);

  const user = await userRepo.update(id, data);
  return NextResponse.json({ success: true, data: user });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "USERS_MANAGE");
  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ success: false, error: "Cannot delete yourself" }, { status: 400 });
  }
  await userRepo.remove(id);
  return NextResponse.json({ success: true });
});
