import { redirect } from "next/navigation";

/** Lessons are gated to coming-soon; individual lesson routes redirect. */
export default function LessonPlayerPage() {
  redirect("/lessons");
}
