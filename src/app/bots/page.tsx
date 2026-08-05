import type { Metadata } from "next";
import { getBotCards } from "@/lib/bots";
import BotDirectory from "./directory-client";

export const metadata: Metadata = {
  title: "Bot Directory",
  description:
    "45 distinctive debate opponents, from first-timers to masters.",
};

export default function BotsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate Bots</h1>
      <p className="mt-2 max-w-2xl text-fg-muted">
        Choose an opponent with the strengths you want to train against — and
        the weaknesses you want to learn to exploit.
      </p>
      <BotDirectory bots={getBotCards()} />
    </div>
  );
}
