import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host === process.env.SUPER_ADMIN_DOMAIN) {
    return rewriteToSurface(request, "/super-admin");
  }

  if (host === process.env.DASHBOARD_DOMAIN) {
    return rewriteToSurface(request, "/dashboard");
  }

  return rewriteToSurface(request, "/site");
}

function rewriteToSurface(request: NextRequest, surfacePath: string) {
  const pathname = request.nextUrl.pathname;
  const destinationPath =
    pathname === surfacePath || pathname.startsWith(`${surfacePath}/`)
      ? pathname
      : `${surfacePath}${pathname}`;

  return NextResponse.rewrite(new URL(destinationPath, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
