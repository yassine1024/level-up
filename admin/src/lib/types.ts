export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Overview {
  teachers: number;
  students: number;
  lessons: number;
  runs: number;
  runsByStatus: Record<string, number>;
  averageLatencyMs: number;
  recentFailures: GenerationRunSummary[];
}

export interface GenerationRunSummary {
  id: number;
  agent: string;
  status: string;
  lessonId: number | null;
  createdAt: string;
  latencyMs: number | null;
}

export interface GenerationRun {
  id: number;
  agent: string;
  endpoint: string;
  lessonId: number | null;
  contentVersion: number | null;
  gameType: string | null;
  triggeredByUserId: number | null;
  triggeredByRole: string | null;
  inputHash: string | null;
  inputRef: string | null;
  status: string;
  attempts: number;
  validationProblems: string | null;
  outputJson: string | null;
  errorCode: number | null;
  errorMessage: string | null;
  model: string | null;
  latencyMs: number | null;
  tokenUsage: number | null;
  fallbackUsed: boolean;
  createdAt: string;
}

export interface Teacher {
  id: number;
  username: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  uploadCount?: number;
}

export interface Student {
  id: number;
  username: string;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface Lesson {
  id: number;
  title: string;
  level: string;
  unit: string;
  contentVersion: number;
  resourceCount: number;
  runCount: number;
}

export interface LessonResource {
  id: number;
  type: string;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  extractedText: string | null;
  extractionStatus: string | null;
  uploadedBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PipelineStep {
  step: string;
  status: string;
  inputRef?: string;
  uploadedBy?: number | null;
  updatedAt?: string;
  runId?: number;
  attempts?: number;
  validationProblems?: string | null;
  fallbackUsed?: boolean;
  createdAt?: string;
}

export interface Pipeline {
  lessonId: number;
  title: string;
  contentVersion: number;
  steps: PipelineStep[];
}

export interface RejectionsSummary {
  byStatus: Record<string, number>;
  byAgent: Record<string, number>;
}

export interface ActivityItem {
  type: string;
  id: number;
  status?: string;
  agent?: string;
  lessonId?: number | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: number;
  adminUserId: number | null;
  action: string;
  targetType: string | null;
  targetId: number | null;
  details: string | null;
  createdAt: string;
}

export interface SystemHealth {
  backend: string;
  agents: string;
  recentErrorCountLastHour: number;
}