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
  StudentCourse,
  User,
  PlacementQuestion,
  PlacementAnswer,
  PlacementAttemptResponse,
  SlideDeck,
  Progress,
  GameType,
  PracticeSession,
  PracticeAnswerResponse,
  PracticeFinishResponse,
  WritingTask,
  WritingSubmission,
  CharacterEpisode,
  CharacterReply,
  StudentMistake,
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
    } catch (error) {
      // Fall back to mock data only when the endpoint is not implemented yet.
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return { items: await mockApi.getLessonLevels(), isDemo: true };
      }
      throw error;
    }
  },

  async getUnits(levelId: string): Promise<TeacherList<LessonUnit>> {
    if (API_MODE === "mock") {
      return { items: await mockApi.getLessonUnits(levelId), isDemo: true };
    }
    try {
      const res = await apiClient.get(`/api/lessons/levels/${levelId}/units`);
      return { items: toItems<LessonUnit>(res.data), isDemo: false };
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return { items: await mockApi.getLessonUnits(levelId), isDemo: true };
      }
      throw error;
    }
  },

  async getLessons(unitId: number): Promise<TeacherList<Lesson>> {
    if (API_MODE === "mock") {
      return { items: await mockApi.getLessons(unitId), isDemo: true };
    }
    try {
      const res = await apiClient.get(`/api/units/${unitId}/lessons`);
      return { items: toItems<Lesson>(res.data), isDemo: false };
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return { items: await mockApi.getLessons(unitId), isDemo: true };
      }
      throw error;
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

export const studentApi = {
  async getCourse(): Promise<StudentCourse> {
    if (API_MODE === "mock") {
      return mockApi.getCourse();
    }
    try {
      const res = await apiClient.get("/api/student/course");
      return res.data as StudentCourse;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.getCourse();
      }
      throw error;
    }
  },

  async getPlacementQuestions(): Promise<PlacementQuestion[]> {
    if (API_MODE === "mock") {
      return mockApi.getPlacementQuestions();
    }
    try {
      const res = await apiClient.get("/api/student/placement-test/questions");
      return res.data as PlacementQuestion[];
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.getPlacementQuestions();
      }
      throw error;
    }
  },

  async submitPlacementAttempt(
    payload: { answers: PlacementAnswer[] }
  ): Promise<PlacementAttemptResponse> {
    if (API_MODE === "mock") {
      return mockApi.submitPlacementAttempt(payload);
    }
    try {
      const res = await apiClient.post(
        "/api/student/placement-test/attempts",
        payload
      );
      return res.data as PlacementAttemptResponse;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.submitPlacementAttempt(payload);
      }
      throw error;
    }
  },

  async generateSlides(
    lessonId: number,
    language = "EN"
  ): Promise<SlideDeck> {
    if (API_MODE === "mock") {
      return mockApi.generateSlides(lessonId, language);
    }
    try {
      const res = await apiClient.post(
        `/api/student/lessons/${lessonId}/slides/generate`,
        null,
        { params: { language } }
      );
      return res.data as SlideDeck;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.generateSlides(lessonId, language);
      }
      throw error;
    }
  },

  async updateProgress(
    lessonId: number,
    lastSlideIndex: number
  ): Promise<Progress> {
    if (API_MODE === "mock") {
      return mockApi.updateProgress(lessonId, lastSlideIndex);
    }
    try {
      const res = await apiClient.patch(
        `/api/student/lessons/${lessonId}/progress`,
        { lastSlideIndex }
      );
      return res.data as Progress;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.updateProgress(lessonId, lastSlideIndex);
      }
      throw error;
    }
  },

  async completeLesson(lessonId: number): Promise<Progress> {
    if (API_MODE === "mock") {
      return mockApi.completeLesson(lessonId);
    }
    try {
      const res = await apiClient.post(
        `/api/student/lessons/${lessonId}/complete`
      );
      return res.data as Progress;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.completeLesson(lessonId);
      }
      throw error;
    }
  },

  async startPracticeSession(
    lessonId: number,
    gameType: GameType
  ): Promise<PracticeSession> {
    if (API_MODE === "mock") {
      return mockApi.startPracticeSession(lessonId, gameType);
    }
    try {
      const res = await apiClient.post(
        `/api/student/lessons/${lessonId}/practice-sessions`,
        { gameType }
      );
      return res.data as PracticeSession;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.startPracticeSession(lessonId, gameType);
      }
      throw error;
    }
  },

  async submitPracticeAnswer(
    sessionId: number,
    questionIndex: number,
    answer: string,
    spoken = false
  ): Promise<PracticeAnswerResponse> {
    if (API_MODE === "mock") {
      return mockApi.submitPracticeAnswer(sessionId, questionIndex, answer, spoken);
    }
    try {
      const res = await apiClient.post(
        `/api/student/practice-sessions/${sessionId}/answers`,
        { questionIndex, answer, spoken }
      );
      return res.data as PracticeAnswerResponse;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.submitPracticeAnswer(sessionId, questionIndex, answer, spoken);
      }
      throw error;
    }
  },

  async finishPracticeSession(
    sessionId: number
  ): Promise<PracticeFinishResponse> {
    if (API_MODE === "mock") {
      return mockApi.finishPracticeSession(sessionId);
    }
    try {
      const res = await apiClient.post(
        `/api/student/practice-sessions/${sessionId}/finish`
      );
      return res.data as PracticeFinishResponse;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.finishPracticeSession(sessionId);
      }
      throw error;
    }
  },

  async getWritingTask(lessonId: number): Promise<WritingTask> {
    if (API_MODE === "mock") {
      return mockApi.getWritingTask(lessonId);
    }
    try {
      const res = await apiClient.get(
        `/api/student/lessons/${lessonId}/writing-task`
      );
      return res.data as WritingTask;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.getWritingTask(lessonId);
      }
      throw error;
    }
  },

  async submitWriting(
    lessonId: number,
    text: string
  ): Promise<WritingSubmission> {
    if (API_MODE === "mock") {
      return mockApi.submitWriting(lessonId, text);
    }
    try {
      const res = await apiClient.post(
        `/api/student/lessons/${lessonId}/writing-submissions`,
        { text }
      );
      return res.data as WritingSubmission;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.submitWriting(lessonId, text);
      }
      throw error;
    }
  },

  async startCharacterEpisode(
    lessonId: number,
    characterRole = "friend",
    scenario = ""
  ): Promise<CharacterEpisode> {
    if (API_MODE === "mock") {
      throw new Error("Character chat is not available in mock mode");
    }
    const res = await apiClient.post(
      `/api/student/lessons/${lessonId}/character/episodes`,
      { characterRole, scenario }
    );
    return res.data as CharacterEpisode;
  },

  async sendCharacterMessage(
    episodeId: number,
    studentMessage: string,
    spoken = false
  ): Promise<CharacterReply> {
    if (API_MODE === "mock") {
      throw new Error("Character chat is not available in mock mode");
    }
    const res = await apiClient.post(
      `/api/student/character/episodes/${episodeId}/messages`,
      { studentMessage, spoken }
    );
    return res.data as CharacterReply;
  },

  async getMistakes(): Promise<StudentMistake[]> {
    if (API_MODE === "mock") {
      return mockApi.getMistakes();
    }
    try {
      const res = await apiClient.get("/api/student/mistakes");
      return res.data as StudentMistake[];
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && NOT_IMPLEMENTED.includes(status)) {
        return mockApi.getMistakes();
      }
      throw error;
    }
  },
};
