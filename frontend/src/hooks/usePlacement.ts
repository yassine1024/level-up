import { useMutation, useQuery } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";
import type { PlacementAnswer } from "@/src/types/api";

export function usePlacementQuestions() {
  return useQuery({
    queryKey: ["student", "placement", "questions"],
    queryFn: () => studentApi.getPlacementQuestions(),
  });
}

export function useSubmitPlacement() {
  return useMutation({
    mutationFn: (answers: PlacementAnswer[]) =>
      studentApi.submitPlacementAttempt({ answers }),
  });
}
