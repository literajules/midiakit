import { createHash, timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  const secret = process.env.JOURNAL_ADMIN_PASSWORD;
  if (!secret) return new Response(null, { status: 503 });
  const body = await request.json().catch(() => null);
  if (typeof body?.password !== "string" || body.password.length > 512) {
    return new Response(null, { status: 401 });
  }
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return new Response(null, { status: timingSafeEqual(hash(body.password), hash(secret)) ? 204 : 401 });
}
