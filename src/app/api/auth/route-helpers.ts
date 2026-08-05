import "server-only";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/auth/crypto";
import { accountForSession, dbConfigured } from "@/lib/auth/db";

export const SESSION_COOKIE = "debates_session";
export const SESSION_DAYS = 60;

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function currentAccount() {
  if (!dbConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return accountForSession(await hashToken(token));
}

/** Shared response when no database is configured for the deployment. */
export const NO_DB = {
  error: "no-database",
  message:
    "Accounts need a database. Set DATABASE_URL in the deployment and sign-ups will persist across devices.",
} as const;
