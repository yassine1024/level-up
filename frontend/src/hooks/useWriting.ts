import { useMutation, useQuery } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";

export function useWritingTask(lessonId: number) {
  return useQuery({
    queryKey: ["student", "writing", lessonId],
    queryFn: () => studentApi.getWritingTask(lessonId),
    enabled: !!lessonId,
  });
}

export function useSubmitWriting() {
  return useMutation({
    mutationFn: ({ lessonId, text }: { lessonId: number; text: string }) =>
      studentApi.submitWriting(lessonId, text),
  });
}
