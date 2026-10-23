import type {
  Lesson,
  LessonLevel,
  LessonUnit,
  SaveResourcesPayload,
  SaveResourcesResponse,
  User,
} from "@/src/types/api";

// Simulated network delay for mock responses.
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const MOCK_LEVELS: LessonLevel[] = [
  { id: "A1", name: "Beginner" },
  { id: "A2", name: "Elementary" },
  { id: "B1", name: "Intermediate" },
  { id: "B2", name: "Upper intermediate" },
  { id: "C1", name: "Advanced" },
];

const UNIT_TITLES = [
  "Meeting people",
  "Around town",
  "At the café",
  "Daily routine",
];

/** Lessons of each unit, in order. */
const UNIT_LESSONS: string[][] = [
  ["Saying hello", "Introducing yourself", "Asking the way"],
  ["Places in town", "Asking for directions", "Taking the bus"],
  ["Ordering a coffee", "At the bakery", "Paying the bill"],
  ["Waking up", "My daily routine", "Telling the time"],
];

// Deterministic ids so a level/unit/lesson keeps the same id across calls:
// unit 1 of A1 -> 101, lesson 2 of that unit -> 1012.
const mockUnits = (levelId: string): LessonUnit[] => {
  const levelIndex = MOCK_LEVELS.findIndex((l) => l.id === levelId);
  const base = (levelIndex < 0 ? 0 : levelIndex + 1) * 100;
  return UNIT_TITLES.slice(0, 4).map((title, index) => ({
    id: base + index + 1,
    levelId,
    number: index + 1,
    title,
  }));
};

const mockLessons = (unitId: number): Lesson[] => {
  const unitIndex = UNIT_TITLES.findIndex(
    (_, index) => unitId % 100 === index + 1
  );
  const titles = UNIT_LESSONS[unitIndex] ?? UNIT_LESSONS[0];
  return titles.map((title, index) => ({
    id: unitId * 10 + index + 1,
    unitId,
    number: index + 1,
    title,
  }));
};

export const mockApi = {
  async getMe(): Promise<User> {
    await delay();
    return {
      id: 1,
      username: "demo",
      role: "STUDENT",
    };
  },

  async login(username: string, _password: string): Promise<{ token: string }> {
    await delay();
    return { token: `mock-token-${username}` };
  },

  async getLessonLevels(): Promise<LessonLevel[]> {
    await delay();
    return MOCK_LEVELS;
  },

  async getLessonUnits(levelId: string): Promise<LessonUnit[]> {
    await delay();
    return mockUnits(levelId);
  },

  async getLessons(unitId: number): Promise<Lesson[]> {
    await delay();
    return mockLessons(unitId);
  },

  async saveResources(
    lessonId: number,
    _payload: SaveResourcesPayload
  ): Promise<SaveResourcesResponse> {
    await delay(700);
    return { lessonId, savedAt: new Date().toISOString() };
  },
};
