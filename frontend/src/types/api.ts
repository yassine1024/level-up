// Shared API contract types for the mobile frontend.
// These mirror the expected Spring Boot backend responses.
// When the backend is ready, keep these in sync with the OpenAPI spec in docs/.

export interface User {
  id: number;
  username: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}

// ── Teacher · course resources ───────────────────────────────────────────
// Contract for GET /api/lessons/levels, GET /api/lessons/levels/:levelId/units,
// GET /api/units/:unitId/lessons and POST /api/teacher/lessons/:id/resources.

/** A CEFR level a course can start from. */
export interface LessonLevel {
  id: string; // "A1"
  name: string; // "Beginner"
}

export interface LessonUnit {
  id: number;
  levelId: string;
  number: number; // 1
  title: string; // "Meeting people"
}

export interface Lesson {
  id: number;
  unitId: number;
  number: number; // 2
  title: string; // "Introducing yourself"
}

/** The resource slots a teacher can fill for a lesson. */
export type ResourceField =
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "listening1"
  | "listening2"
  | "writing"
  | "other";

/** Slots that accept a file. "writing" only holds a description. */
export type ResourceFileField = Exclude<ResourceField, "writing">;

/** A document the teacher picked from the device. */
export interface PickedDocument {
  uri: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  /**
   * Web only: the browser `File` object, required by the DOM FormData.
   * On native React Native reads the file from `uri` instead.
   */
  file?: File;
}

/** A file the teacher attached to a resource slot. */
export interface ResourceFile extends PickedDocument {
  field: ResourceFileField;
}

/** Multipart body of POST /api/teacher/lessons/:id/resources. */
export interface SaveResourcesPayload {
  vocabulary?: ResourceFile;
  grammar?: ResourceFile;
  pronunciation?: ResourceFile;
  listening1?: ResourceFile;
  listening2?: ResourceFile;
  other?: ResourceFile;
  writingDescription?: string;
  otherDescription?: string;
}

export interface SaveResourcesResponse {
  lessonId: number;
  savedAt?: string;
}

/** One line of the "Lesson saved" recap. */
export interface SavedResourceLine {
  /** e.g. "Vocabulary · vocabulary_unit1.pdf" or "Writing description". */
  text: string;
}