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

/** A student shown on the teacher's Students screen. */
export interface TeacherStudent {
  id: number;
  name: string;
  level: string;
  progress: number;
  lastActive: string;
}

/** One line of the "Lesson saved" recap. */
export interface SavedResourceLine {
  /** e.g. "Vocabulary · vocabulary_unit1.pdf" or "Writing description". */
  text: string;
}

// ── Student · home and course ────────────────────────────────────────────
// Contract for GET /api/me/course (reference frame 13) and the slide viewer
// flow (reference frames 15-18). The backend does not serve these endpoints
// yet: the frontend falls back to a mock course and flags it as demo data.

/** A unit the student has already finished (reference frame 13). */
export interface StudentPreviousUnit {
  number: number;
  title: string;
}

/** A unit still locked for the student (reference frame 13). */
export interface StudentNextUnit {
  number: number;
  title: string;
}

/** The lesson the student should open next. */
export interface StudentCurrentLesson {
  id: number;
  number: number;
  title: string;
}

/** The unit the student is currently working through. */
export interface StudentCurrentUnit {
  number: number;
  title: string;
  completedLessons: number;
  totalLessons: number;
  /** 0..1 */
  progress: number;
  currentLesson: StudentCurrentLesson;
}

/** Payload of GET /api/me/course. */
export interface StudentCourse {
  levelId: string;
  levelName: string;
  previousUnits: StudentPreviousUnit[];
  currentUnit: StudentCurrentUnit;
  nextUnits: StudentNextUnit[];
}

// ── Student · placement test ─────────────────────────────────────────────
export interface PlacementQuestion {
  id: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
}

export interface PlacementAnswer {
  questionId: number;
  selectedOption: string;
}

export interface PlacementAttemptRequest {
  answers: PlacementAnswer[];
}

export interface PlacementAttemptResponse {
  attemptId: number;
  score: number;
  totalQuestions: number;
  assignedLevelId: string;
  assignedLevelName: string;
  summary: {
    en: string;
    fr: string;
    ar: string;
  };
}

// ── Student · slides / progress ──────────────────────────────────────────
export interface SlideDeck {
  lessonId: number;
  cached: boolean;
  contentVersion: number;
  language: string;
  slides: unknown;
}

export interface Progress {
  lessonId: number;
  status: string;
  lastSlideIndex: number;
}

// ── Student · practice sessions ──────────────────────────────────────────
export type GameType = "QUIZ" | "FILL_BLANK";

export interface PracticeQuestion {
  index: number;
  prompt: string;
  options: string[];
}

export interface PracticeSession {
  sessionId: number;
  lessonId: number;
  gameType: GameType;
  questions: PracticeQuestion[];
}

export interface PracticeAnswer {
  questionIndex: number;
  answer: string;
  spoken?: boolean;
}

export interface PracticeAnswerResponse {
  questionIndex: number;
  correct: boolean;
  correction: string;
  explanation: string;
}

export interface PracticeFinishResponse {
  sessionId: number;
  score: number;
  totalQuestions: number;
  summary: string;
}

// ── Student · writing ────────────────────────────────────────────────────
export interface WritingTask {
  lessonId: number;
  instructions: string;
}

export interface WritingCorrection {
  category: string;
  sentence: string;
  wrong: string;
  right: string;
  explanation: string;
  focus?: string;
}

export interface WritingSubmission {
  submissionId: number;
  lessonId: number;
  text: string;
  feedback: string;
  correctedText?: string;
  corrections?: WritingCorrection[];
}

export interface CharacterEpisode {
  episodeId: number;
  lessonId: number;
  episode: {
    title: string;
    setting: string;
    character: { name: string; role: string; personality: string };
    goals: string[];
    targetWords: string[];
    openingLine: string;
  };
  openingLine: string;
}

export interface CharacterReply {
  episodeId: number;
  reply: string;
  emotion: string;
  correction: {
    original: string;
    corrected: string;
    explanation: { en: string; fr: string; ar: string };
    focus: string;
    segments: { text: string; change: "same" | "removed" | "added" }[];
  } | null;
  nextInput: { mode: string; suggestions: string[] };
  episodeComplete: boolean;
}

// ── Student · mistakes ───────────────────────────────────────────────────
export interface StudentMistake {
  id: number;
  lessonId: number;
  prompt: string;
  studentAnswer: string;
  correction: string;
  explanation: string;
  createdAt: string;
}