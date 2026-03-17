import type { VercelRequest, VercelResponse } from "@vercel/node";

interface IPResult {
  ipv4: string | null;
  ipv6: string | null;
}

function classifyIP(request: VercelRequest): IPResult {
  const forwarded = request.headers["x-forwarded-for"];
  if (!forwarded) {
    return { ipv4: null, ipv6: null };
  }

  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw.split(",")[0].trim();

  if (ip === "::1") {
    return { ipv4: "127.0.0.1", ipv6: null };
  }

  if (ip.startsWith("::ffff:")) {
    return { ipv4: ip.slice(7), ipv6: null };
  }

  if (ip.includes(":")) {
    return { ipv4: null, ipv6: ip };
  }

  return { ipv4: ip, ipv6: null };
}

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const result = classifyIP(request);
  response.status(200).json(result);
}
