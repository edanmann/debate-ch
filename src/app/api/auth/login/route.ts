import { NextResponse } from "next/server";
import { z } from "zod";
import { hashToken, newSessionToken, verifyPassword } from "@/lib/auth/crypto";
import { createSession, dbConfigured, findAccountByEmail } from "@/lib/auth/db";
import { NO_DB, SESSION_DAYS, setSessionCookie } from "../route-helpers";

const body = z.object({ email: z.email(), password: z.string().min(1) });

export async function POST(request: Request) {
  if (!dbConfigured()) return NextResponse.json(NO_DB, { status: 503 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const account = await findAccountByEmail(email);
    // Same message either way so the form can't be used to enumerate emails.
    const bad = NextResponse.json(
      { error: "bad-credentials", message: "Email or password is incorrect." },
      { status: 401 }
    );
    if (!account) return bad;
    if (!(await verifyPassword(parsed.data.password, account.password_hash))) {
      return bad;
    }
    const token = newSessionToken();
    await createSession(
      await hashToken(token),
      account.id,
      new Date(Date.now() + SESSION_DAYS * 864e5)
    );
    await setSessionCookie(token);
    return NextResponse.json({
      ok: true,
      id: account.id,
      email: account.email,
      profile: account.profile,
    });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
