import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { AppError, ValidationError, UnauthorizedError, ForbiddenError } from "./index";

export type ApiContext = { params: Promise<Record<string, string>> };
export type ApiHandler = (request: NextRequest, context: ApiContext) => Promise<NextResponse>;

function zodErrorsToRecord(err: ZodError): Record<string, string[]> {
  const record: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root";
    if (!record[path]) record[path] = [];
    record[path].push(issue.message);
  }
  return record;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: error.message, errors: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: "Validation failed", errors: zodErrorsToRecord(error) },
      { status: 400 }
    );
  }

  console.error("Unhandled API error:", error);
  const errorMessage = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    try {
      return await handler(request, context ?? {});
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function parseBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    const body = await request.json();
    return schema.parse(body);
  };
}

export async function requireSession() {
  const { getSession } = await import("@/modules/auth/auth.service");
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export function requirePermission(session: { permissions: string[] }, permission: string) {
  if (!session.permissions.includes(permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
