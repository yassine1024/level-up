import { useMutation } from "@tanstack/react-query";
import { studentApi } from "@/src/api/endpoints";
import type { GameType } from "@/src/types/api";

export function useStartPracticeSession() {
  return useMutation({
    mutationFn: ({ lessonId, gameType }: { lessonId: number; gameType: GameType }) =>
      studentApi.startPracticeSession(lessonId, gameType),
  });
}

export function useSubmitPracticeAnswer() {
  return useMutation({
    mutationFn: ({
      sessionId,
      questionIndex,
      answer,
      spoken,
    }: {
      sessionId: number;
      questionIndex: number;
      answer: string;
      spoken?: boolean;
    }) => studentApi.submitPracticeAnswer(sessionId, questionIndex, answer, spoken),
  });
}

export function useFinishPracticeSession() {
  return useMutation({
    mutationFn: (sessionId: number) => studentApi.finishPracticeSession(sessionId),
  });
}
