import { useMutation } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";

export function useGenerateSlides() {
  return useMutation({
    mutationFn: ({ lessonId, language }: { lessonId: number; language?: string }) =>
      studentApi.generateSlides(lessonId, language),
  });
}
