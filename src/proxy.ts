import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

const internalPrefixes = ["/super-admin", "/dashboard", "/site"];
const protectedPrefixes = ["/super-admin", "/dashboard"];

const { auth } = NextAuth(authConfig);
type AuthProxyRequest = NextRequest & { auth: Session | null };

export default auth((request) => {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const pathname = request.nextUrl.pathname;
  const destinationPath = getDestinationPath(host, pathname);
  const isInternalPath = destinationPath === pathname;

  const authResponse = getAuthResponse(request, destinationPath);

  if (authResponse) {
    return authResponse;
  }

  if (isInternalPath) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = destinationPath;

  return NextResponse.rewrite(rewriteUrl);
});

function getDestinationPath(host: string, pathname: string) {
  if (internalPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return pathname;
  }

  if (host === process.env.SUPER_ADMIN_DOMAIN?.toLowerCase()) {
    return `/super-admin${pathname}`;
  }

  if (host === process.env.DASHBOARD_DOMAIN?.toLowerCase()) {
    return `/dashboard${pathname}`;
  }

  return `/site${pathname}`;
}

function getAuthResponse(request: AuthProxyRequest, destinationPath: string) {
  const session = request.auth;

  if (!protectedPrefixes.some((prefix) => destinationPath.startsWith(prefix))) {
    return null;
  }

  const isSuperAdminPath = destinationPath.startsWith("/super-admin");
  const loginPath = isSuperAdminPath ? "/super-admin/login" : "/dashboard/login";
  const homePath = isSuperAdminPath ? "/super-admin" : "/dashboard";
  const isLoginPath = destinationPath === loginPath;
  const isSetupPath = destinationPath.startsWith("/super-admin/setup");

  if (isSetupPath) {
    return null;
  }

  if (!session?.user) {
    if (isLoginPath) {
      return null;
    }

    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (
    (isSuperAdminPath && session.user.role !== "SUPER_ADMIN") ||
    (!isSuperAdminPath && session.user.role !== "TENANT_ADMIN")
  ) {
    const redirectPath = session.user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isLoginPath) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
