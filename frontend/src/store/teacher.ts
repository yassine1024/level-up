import { create } from "zustand";

import type {
  Lesson,
  LessonLevel,
  LessonUnit,
  PickedDocument,
  ResourceFileField,
  SavedResourceLine,
} from "@/src/types/api";

export interface TeacherDraft {
  level: LessonLevel | null;
  unit: LessonUnit | null;
  lesson: Lesson | null;
  files: Partial<Record<ResourceFileField, PickedDocument>>;
  writingDescription: string;
  otherDescription: string;
}

export interface SavedLesson {
  /** Short path shown on the confirmation screen, e.g. "A1". */
  levelLabel: string;
  /** e.g. "Unit 1". */
  unitLabel: string;
  /** e.g. "Lesson 2". */
  lessonLabel: string;
  lines: SavedResourceLine[];
}

const emptyDraft: TeacherDraft = {
  level: null,
  unit: null,
  lesson: null,
  files: {},
  writingDescription: "",
  otherDescription: "",
};

interface TeacherState {
  draft: TeacherDraft;
  lastSaved: SavedLesson | null;
  setDraft: (patch: Partial<TeacherDraft>) => void;
  setFile: (field: ResourceFileField, doc: PickedDocument | null) => void;
  resetDraft: () => void;
  setLastSaved: (saved: SavedLesson) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  draft: emptyDraft,
  lastSaved: null,
  setDraft: (patch) =>
    set((state) => ({ draft: { ...state.draft, ...patch } })),
  setFile: (field, doc) =>
    set((state) => ({
      draft: {
        ...state.draft,
        files: { ...state.draft.files, [field]: doc ?? undefined },
      },
    })),
  resetDraft: () => set({ draft: emptyDraft }),
  setLastSaved: (saved) => set({ lastSaved: saved }),
}));
