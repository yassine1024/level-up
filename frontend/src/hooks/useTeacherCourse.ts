import { useMutation, useQuery } from "@tanstack/react-query";

import { teacherApi } from "@/src/api/endpoints";
import type { SaveResourcesPayload } from "@/src/types/api";

export function useLessonLevels() {
  return useQuery({
    queryKey: ["teacher", "levels"],
    queryFn: () => teacherApi.getLevels(),
  });
}

export function useLessonUnits(levelId: string | null) {
  return useQuery({
    queryKey: ["teacher", "units", levelId],
    queryFn: () => teacherApi.getUnits(levelId as string),
    enabled: !!levelId,
  });
}

export function useLessons(unitId: number | null) {
  return useQuery({
    queryKey: ["teacher", "lessons", unitId],
    queryFn: () => teacherApi.getLessons(unitId as number),
    enabled: unitId != null,
  });
}

export function useSaveResources() {
  return useMutation({
    mutationFn: (vars: { lessonId: number; payload: SaveResourcesPayload }) =>
      teacherApi.saveResources(vars.lessonId, vars.payload),
  });
}
