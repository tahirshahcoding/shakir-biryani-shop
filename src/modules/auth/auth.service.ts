import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db/prisma";
import { authConfig } from "@/config/auth";

const encoder = new TextEncoder();

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${authConfig.cookieMaxAge}s`)
    .sign(encoder.encode(authConfig.jwtSecret));
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(authConfig.jwtSecret));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookieName)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      isActive: true,
      role: {
        select: {
          name: true,
          permissions: {
            select: { permission: { select: { code: true } } },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const permissions = user.role.permissions.map((rp) => rp.permission.code);

  const sessionPayload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    permissions,
  };

  const token = await createSessionToken(sessionPayload);

  return { token, user: sessionPayload };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) throw new Error("User not found");

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const newHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requirePermission(permissionCode: string) {
  const session = await requireAuth();
  if (!session.permissions.includes(permissionCode)) {
    throw new Error(`Permission denied: ${permissionCode}`);
  }
  return session;
}
