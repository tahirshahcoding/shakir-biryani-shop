function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    console.warn("WARNING: Using development JWT secret. Set AUTH_SECRET in .env");
    return "dev-secret-change-in-production-abc123xyz";
  }
  return secret;
}

export const authConfig = {
  get jwtSecret() {
    return getJwtSecret();
  },
  cookieName: "session_token",
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  loginPath: "/login",
  dashboardPath: "/dashboard",
  publicPaths: ["/login", "/api/auth/login", "/api/auth/logout"],
};
