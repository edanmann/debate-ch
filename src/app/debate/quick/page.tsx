import type { Metadata } from "next";
import { getActiveBots } from "@/lib/bots";
import QuickStart from "./quick-client";

export const metadata: Metadata = { title: "Quick Debate" };

export default function QuickDebatePage() {
  const bots = getActiveBots().map((b) => ({
    slug: b.slug,
    name: b.name,
    rating: b.overallRating ?? 50,
  }));
  return <QuickStart bots={bots} />;
}
