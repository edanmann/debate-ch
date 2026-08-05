import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, hashToken, newSessionToken } from "@/lib/auth/crypto";
import {
  createAccount,
  createSession,
  dbConfigured,
  findAccountByEmail,
} from "@/lib/auth/db";
import { NO_DB, SESSION_DAYS, setSessionCookie } from "../route-helpers";

const body = z.object({
  email: z.email(),
  password: z.string().min(8, "Use at least 8 characters"),
  profile: z.unknown().optional(),
});

export async function POST(request: Request) {
  if (!dbConfigured()) return NextResponse.json(NO_DB, { status: 503 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", message: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 }
    );
  }
  const email = parsed.data.email.trim().toLowerCase();

  try {
    if (await findAccountByEmail(email)) {
      return NextResponse.json(
        { error: "exists", message: "That email already has an account — log in instead." },
        { status: 409 }
      );
    }
    const id = crypto.randomUUID();
    await createAccount(
      id,
      email,
      await hashPassword(parsed.data.password),
      parsed.data.profile ?? {}
    );
    const token = newSessionToken();
    const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
    await createSession(await hashToken(token), id, expires);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, id, email });
  } catch {
    return NextResponse.json(
      { error: "server", message: "Could not create the account. Try again." },
      { status: 500 }
    );
  }
}
