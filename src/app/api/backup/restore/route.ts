import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { writeFile, rename, copyFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const DB_PATH = join(process.cwd(), "prisma", "dev.db");
const DB_WAL = join(process.cwd(), "prisma", "dev.db-wal");
const DB_SHM = join(process.cwd(), "prisma", "dev.db-shm");
const DB_BACKUP = join(process.cwd(), "prisma", "dev.db.bak");

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_EDIT");

  const formData = await request.formData();
  const file = formData.get("backup") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
  }

  if (!file.name.endsWith(".db")) {
    return NextResponse.json({ success: false, error: "Invalid file type. Expected .db file" }, { status: 400 });
  }

  // Backup current database before restoring
  if (existsSync(DB_PATH)) {
    await copyFile(DB_PATH, DB_BACKUP);
  }

  // Write the uploaded file
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Remove WAL/SHM files if they exist (they'll be stale after restore)
  try {
    if (existsSync(DB_WAL)) await writeFile(DB_WAL, Buffer.alloc(0));
    if (existsSync(DB_SHM)) await writeFile(DB_SHM, Buffer.alloc(0));
  } catch {
    // Ignore cleanup errors
  }

  await writeFile(DB_PATH, buffer);

  return NextResponse.json({
    success: true,
    message: "Database restored successfully. Please restart the application.",
  });
});
