import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { getSettings, updateSettings } from "@/modules/settings/setting.service";
import { z } from "zod";

const settingsUpdateSchema = z.record(
  z.string().min(1).max(100),
  z.string().max(1000)
);

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_VIEW");
  const settings = await getSettings();
  return NextResponse.json({ success: true, data: settings });
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "SETTINGS_EDIT");
  const body = await request.json();
  const validated = settingsUpdateSchema.parse(body);
  const settings = await updateSettings(validated);
  return NextResponse.json({ success: true, data: settings });
});
