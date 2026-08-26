import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db/prisma";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireSession();

  const { searchParams } = new URL(request.url);
  const detail = searchParams.get("detail") === "true";

  if (detail) {
    const roles = await db.role.findMany({
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
      orderBy: { name: "asc" },
    });

    const data = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions.map((rp) => rp.permission),
    }));

    return NextResponse.json({ success: true, data });
  }

  const roles = await db.role.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: roles });
});

export const POST = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "ROLES_MANAGE");

  const permissions = await db.permission.findMany({
    select: { id: true, code: true, description: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ success: true, data: permissions });
});
