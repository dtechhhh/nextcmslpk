import { handlers } from "@/auth";
import { getClientIp, limitLoginAttempt } from "@/server/services/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  if (isCredentialsCallback(request)) {
    const formData = await request.clone().formData();
    const username = formData.get("username");

    if (typeof username === "string") {
      const rateLimit = await limitLoginAttempt({
        ipAddress: getClientIp(request.headers),
        username,
      });

      if (!rateLimit.success) {
        return Response.json(
          { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
          { status: 429 },
        );
      }

      const headers = new Headers(request.headers);
      headers.set("x-login-rate-limit-checked", "1");

      const forwardedRequest = new Request(request.url, {
        body: request.body,
        headers,
        method: request.method,
        // Required by Node.js when forwarding a streamed request body.
        duplex: "half",
      } as RequestInit & { duplex: "half" });

      return handlers.POST(new NextRequest(forwardedRequest));
    }
  }

  return handlers.POST(request);
}

function isCredentialsCallback(request: Request) {
  return new URL(request.url).pathname.endsWith("/api/auth/callback/credentials");
}
