import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  Overview,
  PageResponse,
  GenerationRun,
  Teacher,
  Student,
  Lesson,
  LessonResource,
  Pipeline,
  RejectionsSummary,
  ActivityItem,
  AuditLogEntry,
  SystemHealth,
  GeneratedContent,
} from "./types";

export function useOverview() {
  return useQuery<Overview>({
    queryKey: ["overview"],
    queryFn: async () => (await api.get("/api/admin/overview")).data,
  });
}

export function useTeachers(page = 0, size = 20) {
  return useQuery<PageResponse<Teacher>>({
    queryKey: ["teachers", page, size],
    queryFn: async () => (await api.get("/api/admin/teachers", { params: { page, size } })).data,
  });
}

export function useStudents(page = 0, size = 20) {
  return useQuery<PageResponse<Student>>({
    queryKey: ["students", page, size],
    queryFn: async () => (await api.get("/api/admin/students", { params: { page, size } })).data,
  });
}

export function useLessons(page = 0, size = 20) {
  return useQuery<PageResponse<Lesson>>({
    queryKey: ["lessons", page, size],
    queryFn: async () => (await api.get("/api/admin/lessons", { params: { page, size } })).data,
  });
}

export function useLessonResources(lessonId: number) {
  return useQuery<{ lessonId: number; resources: LessonResource[] }>({
    queryKey: ["lessonResources", lessonId],
    queryFn: async () => (await api.get(`/api/admin/lessons/${lessonId}/resources`)).data,
    enabled: !!lessonId,
  });
}

export function usePipeline(lessonId: number) {
  return useQuery<Pipeline>({
    queryKey: ["pipeline", lessonId],
    queryFn: async () => (await api.get(`/api/admin/lessons/${lessonId}/pipeline`)).data,
    enabled: !!lessonId,
  });
}

export function useGenerationRuns(page = 0, size = 20, status?: string, agent?: string, lessonId?: number) {
  return useQuery<PageResponse<GenerationRun>>({
    queryKey: ["runs", page, size, status, agent, lessonId],
    queryFn: async () =>
      (await api.get("/api/admin/generation-runs", { params: { page, size, status, agent, lessonId } })).data,
  });
}

export function useRun(id: number) {
  return useQuery<GenerationRun>({
    queryKey: ["run", id],
    queryFn: async () => (await api.get(`/api/admin/generation-runs/${id}`)).data,
    enabled: !!id,
  });
}

export function useRejections() {
  return useQuery<RejectionsSummary>({
    queryKey: ["rejections"],
    queryFn: async () => (await api.get("/api/admin/rejections/summary")).data,
  });
}

export function useActivity() {
  return useQuery<{ items: ActivityItem[] }>({
    queryKey: ["activity"],
    queryFn: async () => (await api.get("/api/admin/activity")).data,
  });
}

export function useAuditLog(page = 0, size = 20) {
  return useQuery<PageResponse<AuditLogEntry>>({
    queryKey: ["audit", page, size],
    queryFn: async () => (await api.get("/api/admin/audit-log", { params: { page, size } })).data,
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ["systemHealth"],
    queryFn: async () => (await api.get("/api/admin/system/health")).data,
  });
}

export function useGeneratedContent(type: string, id: number) {
  return useQuery<GeneratedContent>({
    queryKey: ["generated", type, id],
    queryFn: async () => (await api.get(`/api/admin/generated/${type}/${id}`)).data,
    enabled: !!type && !!id,
  });
}

export function useHideContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id, hidden }: { type: string; id: number; hidden: boolean }) =>
      (await api.post(`/api/admin/generated/${type}/${id}/hide`, null, { params: { hidden } })).data,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["generated", vars.type, vars.id] });
    },
  });
}

export function useRegenerateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: number) =>
      (await api.post(`/api/admin/lessons/${lessonId}/regenerate`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons"] });
      qc.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });
}