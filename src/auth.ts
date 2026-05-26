import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/server/db/client";
import {
  decryptTOTPSecret,
  verifyPassword,
  verifyTOTPCode,
} from "@/server/services/auth";
import {
  getClientIp,
  limitLoginAttempt,
  limitTOTPVerifyAttempt,
} from "@/server/services/rate-limit";

const authorizeSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  totpCode: z.string().optional(),
  scope: z.enum(["super-admin", "dashboard"]),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "TOTP code", type: "text" },
        scope: { label: "Scope", type: "text" },
      },
      async authorize(credentials, request) {
        const parsed = authorizeSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { username, password, totpCode, scope } = parsed.data;
        const expectedRole = scope === "super-admin" ? "SUPER_ADMIN" : "TENANT_ADMIN";
        const loginRateLimit =
          request.headers.get("x-login-rate-limit-checked") === "1"
            ? { success: true }
            : await limitLoginAttempt({
                ipAddress: getClientIp(request.headers),
                username,
              });

        if (!loginRateLimit.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            username: true,
            passwordHash: true,
            role: true,
            tenantId: true,
            totpSecret: true,
            totpVerified: true,
            securityStamp: true,
            isActive: true,
            tenant: {
              select: {
                status: true,
              },
            },
          },
        });

        if (
          !user ||
          !user.isActive ||
          user.role !== expectedRole ||
          (user.role === "TENANT_ADMIN" && user.tenant?.status !== "ACTIVE")
        ) {
          return null;
        }

        const passwordValid = await verifyPassword(password, user.passwordHash);

        if (!passwordValid) {
          return null;
        }

        if (!user.totpVerified) {
          if (user.role !== "TENANT_ADMIN") {
            return null;
          }
        } else {
          if (!user.totpSecret) {
            return null;
          }

          let decryptedSecret: string;

          try {
            decryptedSecret = decryptTOTPSecret(user.totpSecret);
          } catch {
            return null;
          }

          const rateLimit = await limitTOTPVerifyAttempt({
            ipAddress: getClientIp(request.headers),
            username: user.username,
          });

          if (!rateLimit.success) {
            return null;
          }

          if (!totpCode || !verifyTOTPCode(decryptedSecret, totpCode)) {
            return null;
          }
        }

        return {
          id: user.id,
          userId: user.id,
          username: user.username,
          name: user.username,
          role: user.role,
          tenantId: user.tenantId,
          securityStamp: user.securityStamp,
        };
      },
    }),
  ],
});
