import { API_MODE, apiClient, postMultipart } from "./client";
import { mockApi } from "./mock";
import { appendDocument } from "./upload";
import type {
  Lesson,
  LessonLevel,
  LessonUnit,
  LoginRequest,
  ResourceFileField,
  SaveResourcesPayload,
  SaveResourcesResponse,
  User,
} from "@/src/types/api";

export const userApi = {
  getMe: async (): Promise<User> => {
    if (API_MODE === "mock") return mockApi.getMe();
    const res = await apiClient.get<User>("/api/users/me");
    return res.data;
  },
};

export const authApi = {
  login: async (payload: LoginRequest): Promise<{ token: string }> => {
    if (API_MODE === "mock") return mockApi.login(payload.username, payload.password);
    const res = await apiClient.post<{ token: string }>("/api/auth/login", payload);
    return res.data;
  },
  register: async (payload: {
    username: string;
    password: string;
    role: string;
  }): Promise<{ token: string }> => {
    if (API_MODE === "mock") return mockApi.login(payload.username, payload.password);
    const res = await apiClient.post<{ token: string }>("/api/auth/register", payload);
    return res.data;
  },
};

/** A list coming from the API, flagged when it comes from the mock layer. */
export interface TeacherList<T> {
  items: T[];
  /** True when the backend does not serve this endpoint yet. */
  isDemo: boolean;
}

/** Accepts a bare array or an envelope such as `{ data: [...] }`. */
function toItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const value of Object.values(payload as Record<string, unknown>)) {
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

/** Statuses meaning "this endpoint is not implemented yet". */
const NOT_IMPLEMENTED = [404, 501];

export const teacherApi = {
  async getLevels(): Promise<TeacherList<LessonLevel>> {
    if (API_MODE === "mock") {
      return { items: await mockApi.getLessonLevels(), isDemo: true };
    }
    try {
      const res = await apiClient.get("/api/lessons/levels");
      return { items: toItems<LessonLevel>(res.data), isDemo: false };
    } catch {
      // The lessons endpoints are not served by the backend yet: keep the
      // screen usable with the mock course and flag it as demo data.
      return { items: await mockApi.getLessonLevels(), isDemo: true };
    }
  },

  async getUnits(levelId: string): Promise<TeacherList<LessonUnit>> {
    if (API_MODE === "mock") {
      return { items: await mockApi.getLessonUnits(levelId), isDemo: true };
    }
    try {
      const res = await apiClient.get(`/api/lessons/levels/${levelId}/units`);
      return { items: toItems<LessonUnit>(res.data), isDemo: false };
    } catch {
      return { items: await mockApi.getLessonUnits(levelId), isDemo: true };
    }
  },

  async getLessons(unitId: number): Promise<TeacherList<Lesson>> {
    if (API_MODE === "mock") {
      return { items: await mockApi.getLessons(unitId), isDemo: true };
    }
    try {
      const res = await apiClient.get(`/api/units/${unitId}/lessons`);
      return { items: toItems<Lesson>(res.data), isDemo: false };
    } catch {
      return { items: await mockApi.getLessons(unitId), isDemo: true };
    }
  },

  async saveResources(
    lessonId: number,
    payload: SaveResourcesPayload
  ): Promise<SaveResourcesResponse> {
    if (API_MODE === "mock") {
      return mockApi.saveResources(lessonId, payload);
    }

    const form = new FormData();
    const fileFields: ResourceFileField[] = [
      "vocabulary",
      "grammar",
      "pronunciation",
      "listening1",
      "listening2",
      "other",
    ];
    for (const field of fileFields) {
      const file = payload[field];
      if (file) appendDocument(form, field, file);
    }
    if (payload.writingDescription?.trim()) {
      form.append("writingDescription", payload.writingDescription.trim());
    }
    if (payload.otherDescription?.trim()) {
      form.append("otherDescription", payload.otherDescription.trim());
    }

    try {
      return await postMultipart<SaveResourcesResponse>(
        `/api/teacher/lessons/${lessonId}/resources`,
        form
      );
    } catch (error) {
      // 404/501 means the endpoint does not exist yet, not that the save
      // failed: acknowledge it locally so the flow can be demonstrated.
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.saveResources(lessonId, payload);
      }
      throw error;
    }
  },
};
