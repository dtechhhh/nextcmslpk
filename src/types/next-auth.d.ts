import type { SessionUser, UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    userId: string;
    username: string;
    role: UserRole;
    tenantId: string | null;
    securityStamp: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    username: string;
    role: UserRole;
    tenantId: string | null;
    securityStamp: string;
    lastActivity: number;
  }
}
