import { NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { readFile } from "fs/promises";
import { join } from "path";

const DB_PATH = join(process.cwd(), "prisma", "dev.db");

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_VIEW");

  const dbBuffer = await readFile(DB_PATH);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const filename = `biryani-backup-${timestamp}.db`;

  return new NextResponse(dbBuffer, {
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(dbBuffer.length),
    },
  });
});
