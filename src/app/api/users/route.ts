import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createUserSchema } from "@/lib/validation/schemas";
import bcrypt from "bcryptjs";
import * as userRepo from "@/modules/users/user.repository";
import { ConflictError } from "@/lib/errors";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "USERS_VIEW");
  const { searchParams } = new URL(request.url);
  const result = await userRepo.findMany({
    search: searchParams.get("search") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 25,
  });
  return NextResponse.json({ success: true, data: result });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "USERS_CREATE");
  const body = await request.json();
  const validated = createUserSchema.parse(body);

  const existing = await userRepo.findByEmail(validated.email);
  if (existing) throw new ConflictError("Email already exists");

  const hashedPassword = await bcrypt.hash(validated.password, 12);
  const user = await userRepo.create({
    name: validated.name,
    email: validated.email,
    passwordHash: hashedPassword,
    roleId: validated.roleId,
  });
  return NextResponse.json({ success: true, data: user }, { status: 201 });
});
