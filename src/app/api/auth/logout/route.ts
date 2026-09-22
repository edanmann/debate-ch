import { NextResponse } from "next/server";

const GONE = {
  error: "gone",
  message:
    "Account APIs now use Supabase Auth. Sign out from the Settings page.",
};

export async function POST() {
  return NextResponse.json(GONE, { status: 410 });
}
