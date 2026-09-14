import { createFileRoute } from "@tanstack/react-router";
import { LessonView } from "@/features/lesson-view";

export const Route = createFileRoute("/lecon/$id")({
  component: function LessonRoute() {
    const { id } = Route.useParams();
    return <LessonView id={id} />;
  },
});
