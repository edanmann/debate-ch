import type { Metadata } from "next";
import { getActiveBots, toCardData } from "@/lib/bots";
import CoachClient from "./coach-client";

export const metadata: Metadata = { title: "Choose a Coach" };

export default function CoachPage() {
  const bots = getActiveBots().map(toCardData);
  return <CoachClient bots={bots} />;
}
