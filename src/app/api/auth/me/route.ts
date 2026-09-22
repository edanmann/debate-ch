import { NextResponse } from "next/server";

/** Legacy Neon auth routes — replaced by Supabase Auth on the client. */
const GONE = {
  error: "gone",
  message:
    "Account APIs now use Supabase Auth. Sign up and log in from the app pages.",
};

export async function GET() {
  return NextResponse.json(GONE, { status: 410 });
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 });
}

export async function PUT() {
  return NextResponse.json(GONE, { status: 410 });
}
