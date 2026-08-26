import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireSession, requirePermission } from "@/lib/errors/api-handler";
import { getSalesReport, getExpenseReport, getInventoryReport, getProductReport } from "@/modules/reports/report.service";
import { AppError } from "@/lib/errors";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  requirePermission(session, "REPORTS_VIEW");
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sales";
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  let data;
  switch (type) {
    case "sales":
      data = await getSalesReport({ startDate, endDate });
      break;
    case "expenses":
      data = await getExpenseReport({ startDate, endDate });
      break;
    case "inventory":
      data = await getInventoryReport();
      break;
    case "products":
      data = await getProductReport({ startDate, endDate });
      break;
    default:
      throw new AppError("Invalid report type", 400);
  }

  return NextResponse.json({ success: true, data });
});
