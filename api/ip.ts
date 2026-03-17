import type { VercelRequest, VercelResponse } from "@vercel/node";

function extractIPv4(request: VercelRequest): string | null {
  const forwarded = request.headers["x-forwarded-for"];
  if (!forwarded) {
    return null;
  }

  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw.split(",")[0].trim();

  if (ip === "::1") {
    return "127.0.0.1";
  }

  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }

  return ip;
}

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const ipv4 = extractIPv4(request);
  response.status(200).json({ ipv4 });
}
