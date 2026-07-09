import { Readable } from "node:stream";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";

import { R2_BUCKET_NAME, r2Client } from "@/lib/r2";
import { prisma } from "@/server/db/client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  return handleMediaRequest(request, params, true);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  return handleMediaRequest(request, params, false);
}

async function handleMediaRequest(
  request: NextRequest,
  params: Promise<{ mediaId: string }>,
  includeBody: boolean,
) {
  const { mediaId } = await params;

  if (!mediaId) {
    return new NextResponse("Media tidak ditemukan.", { status: 404 });
  }

  const media = await prisma.mediaAsset.findFirst({
    where: {
      id: mediaId,
      status: "ACTIVE",
    },
    select: {
      fileName: true,
      fileSize: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!media) {
    return new NextResponse("Media tidak ditemukan.", { status: 404 });
  }

  if (!includeBody) {
    const headers = buildBaseHeaders(media);
    const range = parseRangeHeader(request.headers.get("range"), media.fileSize);

    if (range) {
      headers.set("Content-Length", String(range.end - range.start + 1));
      headers.set("Content-Range", `bytes ${range.start}-${range.end}/${media.fileSize}`);

      return new NextResponse(null, { status: 206, headers });
    }

    headers.set("Content-Length", String(media.fileSize));

    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const object = await r2Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: media.storagePath,
        Range: request.headers.get("range") ?? undefined,
      }),
    );
    const body = toResponseBody(object.Body);

    if (!body) {
      return new NextResponse("Media tidak bisa dibaca.", { status: 502 });
    }

    const headers = buildBaseHeaders(media);
    headers.set("Content-Type", object.ContentType ?? media.mimeType);

    if (typeof object.ContentLength === "number") {
      headers.set("Content-Length", String(object.ContentLength));
    }

    if (object.ContentRange) {
      headers.set("Content-Range", object.ContentRange);
    }

    if (object.ETag) {
      headers.set("ETag", object.ETag);
    }

    if (object.LastModified) {
      headers.set("Last-Modified", object.LastModified.toUTCString());
    }

    return new NextResponse(body, {
      status: object.ContentRange ? 206 : 200,
      headers,
    });
  } catch {
    return new NextResponse("Media tidak bisa dibaca.", { status: 502 });
  }
}

function buildBaseHeaders(media: {
  fileName: string;
  mimeType: string;
}) {
  return new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": media.mimeType,
    "Content-Disposition": `inline; filename="${encodeHeaderFileName(media.fileName)}"`,
  });
}

function parseRangeHeader(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader) {
    return null;
  }

  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);

  if (!match) {
    return null;
  }

  const [, startValue, endValue] = match;
  let start = startValue ? Number(startValue) : 0;
  let end = endValue ? Number(endValue) : fileSize - 1;

  if (!startValue && endValue) {
    const suffixLength = Number(endValue);
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}

function toResponseBody(body: unknown): BodyInit | null {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof Uint8Array) {
    const buffer = new ArrayBuffer(body.byteLength);
    new Uint8Array(buffer).set(body);
    return new Blob([buffer]);
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  if (isReadableStream(body)) {
    return body;
  }

  return null;
}

function isReadableStream(body: unknown): body is ReadableStream<Uint8Array> {
  return (
    typeof body === "object" &&
    body !== null &&
    "getReader" in body &&
    typeof body.getReader === "function"
  );
}

function encodeHeaderFileName(fileName: string) {
  return fileName.replace(/["\\]/g, "_");
}
