"use client";

import { ExerciseRunner, type ExerciseData } from "@/components/study/exercise-runner";

/** Bọc client cho ExerciseRunner trong trang nghe — onExit cuộn tới transcript. */
export function ListeningExercises({
  title,
  exercises,
}: {
  title: string;
  exercises: ExerciseData[];
}) {
  return (
    <ExerciseRunner
      title={title}
      exercises={exercises}
      kind="quiz"
      itemType={null}
      onExit={() => document.getElementById("transcript")?.scrollIntoView({ behavior: "smooth" })}
    />
  );
}
