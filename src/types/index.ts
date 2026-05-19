import type { ComponentType } from "react";

export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN";
export type VariantKey = "indonesia" | "japan";

export interface JWTPayload {
  userId: string
  username: string
  role: "SUPER_ADMIN" | "TENANT_ADMIN"
  tenantId: string | null
  securityStamp: string
  lastActivity: number
}

export interface SessionUser {
  userId: string
  username: string
  role: "SUPER_ADMIN" | "TENANT_ADMIN"
  tenantId: string | null
}

export interface ThemeRegistry {
  key: string;
  name: string;
  indonesia: Record<string, ComponentType<any>>;
  japan: Record<string, ComponentType<any>>;
  layouts: {
    indonesia: ComponentType<any>;
    japan: ComponentType<any>;
  };
}

export interface Pagination<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PaginationResponse<T> = Pagination<T>;

export interface AuditLogEntry {
  tenantId: string | null
  userId: string
  action: string
  targetType: string
  targetId: string | null
  metadata: {
    pageKey?: string
    collectionKey?: string
    oldStatus?: string
    newStatus?: string
    [key: string]: unknown
  }
  ipAddress: string | null
}
