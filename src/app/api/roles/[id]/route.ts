import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission, ApiContext } from "@/lib/errors/api-handler";
import { updateRolePermissionsSchema } from "@/lib/validation/schemas";
import { db } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: ApiContext) => {
  const session = await requireSession();
  requirePermission(session, "ROLES_MANAGE");

  const { id } = await params;
  const role = await db.role.findUnique({ where: { id }, select: { id: true } });
  if (!role) throw new NotFoundError("Role");

  const body = await request.json();
  const validated = updateRolePermissionsSchema.parse(body);

  // Look up permission IDs from codes
  const permissions = await db.permission.findMany({
    where: { code: { in: validated.permissionCodes } },
    select: { id: true },
  });

  // Replace all role permissions atomically
  await db.$transaction([
    db.rolePermission.deleteMany({ where: { roleId: id } }),
    db.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: id, permissionId: p.id })),
    }),
  ]);

  // Return updated role
  const updated = await db.role.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: {
        select: {
          permission: { select: { code: true, description: true } },
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      ...updated,
      permissions: updated!.permissions.map((rp) => rp.permission),
    },
  });
});
