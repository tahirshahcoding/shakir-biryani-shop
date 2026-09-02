import { NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { createBackup } from "@/modules/backup/backup.service";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_VIEW");

  const backup = await createBackup();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const filename = `biryani-backup-${timestamp}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});