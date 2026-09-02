import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { restoreBackup, validateBackup } from "@/modules/backup/backup.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_EDIT");

  const formData = await request.formData();
  const file = formData.get("backup") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
  }

  if (!file.name.endsWith(".json")) {
    return NextResponse.json({ success: false, error: "Invalid file type. Expected a .json backup file" }, { status: 400 });
  }

  let backup: unknown;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid backup file. Could not parse JSON" }, { status: 400 });
  }

  if (!validateBackup(backup)) {
    return NextResponse.json({ success: false, error: "Invalid backup file. Structure is not recognized" }, { status: 400 });
  }

  const exportedAt = new Date(backup.exportedAt).toISOString();

  await restoreBackup(backup);

  return NextResponse.json({
    success: true,
    message: `Database restored successfully from backup (${exportedAt}). Please log in again.`,
  });
});