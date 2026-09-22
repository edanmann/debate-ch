import { NextResponse } from "next/server";

const GONE = {
  error: "gone",
  message:
    "Account APIs now use Supabase Auth. Sign up and log in from the app pages.",
};

export async function POST() {
  return NextResponse.json(GONE, { status: 410 });
}
