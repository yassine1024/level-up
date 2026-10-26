import { useMutation } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";

export function useUpdateProgress() {
  return useMutation({
    mutationFn: ({
      lessonId,
      lastSlideIndex,
    }: {
      lessonId: number;
      lastSlideIndex: number;
    }) => studentApi.updateProgress(lessonId, lastSlideIndex),
  });
}

export function useCompleteLesson() {
  return useMutation({
    mutationFn: (lessonId: number) => studentApi.completeLesson(lessonId),
  });
}
