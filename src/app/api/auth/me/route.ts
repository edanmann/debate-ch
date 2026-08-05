import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConfigured, saveProfile } from "@/lib/auth/db";
import { currentAccount } from "../route-helpers";

/** Returns the signed-in account, or `configured: false` in demo mode. */
export async function GET() {
  if (!dbConfigured()) return NextResponse.json({ configured: false, account: null });
  const account = await currentAccount();
  return NextResponse.json({
    configured: true,
    account: account
      ? { id: account.id, email: account.email, profile: account.profile }
      : null,
  });
}

/** Persists the player's profile + progress so other devices can restore it. */
export async function PUT(request: Request) {
  if (!dbConfigured()) return NextResponse.json({ ok: false, configured: false });
  const account = await currentAccount();
  if (!account) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = z.object({ profile: z.unknown() }).safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await saveProfile(account.id, parsed.data.profile);
  return NextResponse.json({ ok: true });
}
