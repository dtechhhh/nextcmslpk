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
  const isSurfacePath =
    pathname === surfacePath || pathname.startsWith(`${surfacePath}/`);
  const destinationPath =
    isSurfacePath ? pathname : `${surfacePath}${pathname}`;
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-pathname", destinationPath);

  if (isSurfacePath) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const destinationUrl = request.nextUrl.clone();
  destinationUrl.pathname = destinationPath;

  return NextResponse.rewrite(destinationUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
