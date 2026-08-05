import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/auth/crypto";
import { dbConfigured, deleteSession } from "@/lib/auth/db";
import { clearSessionCookie, SESSION_COOKIE } from "../route-helpers";

export async function POST() {
  if (dbConfigured()) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        await deleteSession(await hashToken(token));
      } catch {
        // Session row may already be gone; clearing the cookie is enough.
      }
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
