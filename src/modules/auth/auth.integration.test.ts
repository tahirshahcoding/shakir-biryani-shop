import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({ db: {} }));

import * as authService from "./auth.service";

describe("auth.service integration", () => {
  describe("hashPassword + verifyPassword", () => {
    it("hashes and verifies a password", async () => {
      const hash = await authService.hashPassword("my-password");
      expect(hash).not.toBe("my-password");
      expect(hash.length).toBeGreaterThan(20);
      const valid = await authService.verifyPassword("my-password", hash);
      expect(valid).toBe(true);
    });

    it("rejects wrong password", async () => {
      const hash = await authService.hashPassword("correct");
      const valid = await authService.verifyPassword("wrong", hash);
      expect(valid).toBe(false);
    });

    it("produces different hashes for same password (salt)", async () => {
      const hash1 = await authService.hashPassword("same-password");
      const hash2 = await authService.hashPassword("same-password");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("createSessionToken + verifySessionToken", () => {
    const payload = { userId: "user-1", email: "test@test.com", name: "Test User", role: "ADMIN", permissions: ["PRODUCTS_VIEW"] };

    it("creates and verifies a valid token", async () => {
      const token = await authService.createSessionToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const verified = await authService.verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified!.userId).toBe("user-1");
      expect(verified!.email).toBe("test@test.com");
      expect(verified!.role).toBe("ADMIN");
      expect(verified!.permissions).toEqual(["PRODUCTS_VIEW"]);
    });

    it("rejects an invalid token", async () => {
      const result = await authService.verifySessionToken("garbage-token");
      expect(result).toBeNull();
    });

    it("rejects a tampered token", async () => {
      const token = await authService.createSessionToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      const result = await authService.verifySessionToken(tampered);
      expect(result).toBeNull();
    });

    it("creates token with different roles", async () => {
      const cashierToken = await authService.createSessionToken({
        userId: "user-1",
        email: "cashier@test.com",
        name: "Cashier User",
        role: "CASHIER",
        permissions: ["POS_ACCESS"],
      });
      const verified = await authService.verifySessionToken(cashierToken);
      expect(verified!.role).toBe("CASHIER");
      expect(verified!.permissions).toEqual(["POS_ACCESS"]);
    });
  });
});
