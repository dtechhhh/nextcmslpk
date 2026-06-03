import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host") || "");

  if (isSameHost(host, process.env.SUPER_ADMIN_DOMAIN)) {
    if (request.nextUrl.pathname === "/dashboard/login") {
      return redirectToPath(request, "/super-admin/login");
    }

    return rewriteToSurface(request, "/super-admin");
  }

  if (isSameHost(host, process.env.DASHBOARD_DOMAIN)) {
    if (request.nextUrl.pathname === "/super-admin/login") {
      return redirectToPath(request, "/dashboard/login");
    }

    return rewriteToSurface(request, "/dashboard");
  }

  return rewriteToSurface(request, "/site");
}

function redirectToPath(request: NextRequest, pathname: string) {
  const destinationUrl = request.nextUrl.clone();

  destinationUrl.pathname = pathname;
  destinationUrl.search = "";

  return NextResponse.redirect(destinationUrl);
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

function isSameHost(left: string, right?: string) {
  if (!right) {
    return false;
  }

  const normalizedRight = normalizeHost(right);

  return left === normalizedRight || stripPort(left) === stripPort(normalizedRight);
}

function normalizeHost(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}

function stripPort(host: string) {
  if (host.startsWith("[")) {
    const bracketEnd = host.indexOf("]");

    return bracketEnd >= 0 ? host.slice(0, bracketEnd + 1) : host;
  }

  const [hostname, port, ...rest] = host.split(":");

  if (hostname && port && rest.length === 0 && /^\d{1,5}$/.test(port)) {
    return hostname;
  }

  return host;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
