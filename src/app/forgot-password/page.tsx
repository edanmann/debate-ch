"use client";

import Link from "next/link";
import { Card } from "@/components/ui";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Password reset</h1>
      <Card className="mt-6 p-6 text-sm text-fg-muted">
        <p>
          This prototype runs in demo mode without passwords, so there is
          nothing to reset. Your profile lives on this device only.
        </p>
        <p className="mt-3">
          When hosted authentication ships, this page will send a reset link to
          your email address.
        </p>
        <p className="mt-4">
          <Link href="/login" className="text-brand underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
