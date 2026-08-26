import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/modules/auth/auth.service";
import { authConfig } from "@/config/auth";
import { loginSchema } from "@/lib/validation/schemas";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateKey = `login:${ip}:${email}`;

    const { allowed, remaining } = checkRateLimit(rateKey);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const loginResult = await loginUser(email, password);

    if (!loginResult) {
      const response = NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      return response;
    }

    resetRateLimit(rateKey);
    const response = NextResponse.json({
      success: true,
      data: { user: loginResult.user },
    });

    response.cookies.set(authConfig.cookieName, loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.cookieMaxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
