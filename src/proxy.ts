import { NextRequest, NextResponse } from "next/server";

const internalPrefixes = ["/super-admin", "/dashboard", "/site"];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const pathname = request.nextUrl.pathname;

  if (internalPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (host === process.env.SUPER_ADMIN_DOMAIN?.toLowerCase()) {
    return NextResponse.rewrite(
      new URL(`/super-admin${pathname}`, request.url),
    );
  }

  if (host === process.env.DASHBOARD_DOMAIN?.toLowerCase()) {
    return NextResponse.rewrite(new URL(`/dashboard${pathname}`, request.url));
  }

  return NextResponse.rewrite(new URL(`/site${pathname}`, request.url));
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
