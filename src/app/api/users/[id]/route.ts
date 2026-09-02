import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { updateUserSchema } from "@/lib/validation/schemas";
import bcrypt from "bcryptjs";
import * as userRepo from "@/modules/users/user.repository";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async (_request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "USERS_VIEW");
  const { id } = await params;
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError("User");
  return NextResponse.json({ success: true, data: user });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "USERS_EDIT");
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
  requirePermission(session, "USERS_DELETE");
  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ success: false, error: "Cannot delete yourself" }, { status: 400 });
  }
  const target = await userRepo.findById(id);
  if (!target) throw new NotFoundError("User");
  if (target.isActive) {
    const [activeCount] = await Promise.all([userRepo.countActive()]);
    if (activeCount <= 1) {
      return NextResponse.json({ success: false, error: "Cannot deactivate the last active user" }, { status: 400 });
    }
  }
  await userRepo.deactivate(id);
  return NextResponse.json({ success: true });
});
