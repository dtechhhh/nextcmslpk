import type { NextAuthConfig } from "next-auth";

export const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

export const authConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/dashboard/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 20 * 60,
    updateAge: 60,
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      const now = Date.now();

      if (user) {
        token.userId = user.userId ?? user.id;
        token.username = user.username;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.securityStamp = user.securityStamp;
        token.lastActivity = now;

        return token;
      }

      const updateLastActivity =
        trigger === "update" ? getSessionLastActivity(session) : null;
      const lastActivity = updateLastActivity ?? token.lastActivity;

      if (
        typeof lastActivity !== "number" ||
        now - lastActivity > IDLE_TIMEOUT_MS
      ) {
        return null;
      }

      if (trigger === "update") {
        const securityStamp = getSessionSecurityStamp(session);

        if (securityStamp) {
          token.securityStamp = securityStamp;
        }
      }

      token.lastActivity = updateLastActivity ?? lastActivity;

      return token;
    },
    session({ session, token }) {
      const role =
        token.role === "SUPER_ADMIN" || token.role === "TENANT_ADMIN"
          ? token.role
          : null;
      const tenantId =
        typeof token.tenantId === "string" || token.tenantId === null
          ? token.tenantId
          : null;

      if (
        session.user &&
        typeof token.userId === "string" &&
        typeof token.username === "string" &&
        role
      ) {
        session.user.userId = token.userId;
        session.user.username = token.username;
        session.user.role = role;
        session.user.tenantId = tenantId;

        if (typeof token.securityStamp === "string") {
          session.user.securityStamp = token.securityStamp;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

function getSessionLastActivity(session: unknown) {
  if (!isRecord(session) || typeof session.lastActivity !== "number") {
    return null;
  }

  const now = Date.now();

  if (
    !Number.isFinite(session.lastActivity) ||
    session.lastActivity <= 0 ||
    session.lastActivity > now + 5000
  ) {
    return null;
  }

  return session.lastActivity;
}

function getSessionSecurityStamp(session: unknown) {
  if (!isRecord(session) || !isRecord(session.user)) {
    return null;
  }

  return typeof session.user.securityStamp === "string"
    ? session.user.securityStamp
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
