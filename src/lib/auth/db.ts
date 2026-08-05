import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Account storage. Backed by Postgres (Neon / Vercel Postgres / any
 * connection string in DATABASE_URL or POSTGRES_URL). When no connection
 * string is configured the app runs in device-local demo mode and the auth
 * API reports that honestly rather than pretending to persist.
 */

export interface AccountRow {
  id: string;
  email: string;
  password_hash: string;
  profile: unknown;
  created_at: string;
}

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  null;

export function dbConfigured(): boolean {
  return Boolean(connectionString);
}

type SqlClient = ReturnType<typeof neon>;
let client: SqlClient | null = null;
let schemaReady: Promise<void> | null = null;

function sql(): SqlClient {
  if (!connectionString) throw new Error("no-database");
  client ??= neon(connectionString);
  return client;
}

/** Create tables on first use so deployment needs no migration step. */
export async function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const q = sql();
    await q`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await q`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL
      )`;
    await q`CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions(account_id)`;
  })();
  return schemaReady;
}

export async function findAccountByEmail(
  email: string
): Promise<AccountRow | null> {
  await ensureSchema();
  const rows = (await sql()`
    SELECT id, email, password_hash, profile, created_at
    FROM accounts WHERE email = ${email} LIMIT 1
  `) as AccountRow[];
  return rows[0] ?? null;
}

export async function createAccount(
  id: string,
  email: string,
  passwordHash: string,
  profile: unknown
): Promise<void> {
  await ensureSchema();
  await sql()`
    INSERT INTO accounts (id, email, password_hash, profile)
    VALUES (${id}, ${email}, ${passwordHash}, ${JSON.stringify(profile)}::jsonb)
  `;
}

export async function saveProfile(
  accountId: string,
  profile: unknown
): Promise<void> {
  await ensureSchema();
  await sql()`
    UPDATE accounts SET profile = ${JSON.stringify(profile)}::jsonb
    WHERE id = ${accountId}
  `;
}

export async function createSession(
  tokenHash: string,
  accountId: string,
  expiresAt: Date
): Promise<void> {
  await ensureSchema();
  await sql()`
    INSERT INTO sessions (token_hash, account_id, expires_at)
    VALUES (${tokenHash}, ${accountId}, ${expiresAt.toISOString()})
  `;
}

export async function accountForSession(
  tokenHash: string
): Promise<AccountRow | null> {
  await ensureSchema();
  const rows = (await sql()`
    SELECT a.id, a.email, a.password_hash, a.profile, a.created_at
    FROM sessions s JOIN accounts a ON a.id = s.account_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now()
    LIMIT 1
  `) as AccountRow[];
  return rows[0] ?? null;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await ensureSchema();
  await sql()`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}
