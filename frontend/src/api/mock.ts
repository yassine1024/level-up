import type {
  Lesson,
  LessonLevel,
  LessonUnit,
  SaveResourcesPayload,
  SaveResourcesResponse,
  StudentCourse,
  User,
  PlacementQuestion,
  PlacementAttemptResponse,
  SlideDeck,
  Progress,
  GameType,
  PracticeSession,
  PracticeAnswerResponse,
  PracticeFinishResponse,
  WritingTask,
  WritingSubmission,
  StudentMistake,
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

  async getCourse(): Promise<StudentCourse> {
    await delay();
    return {
      levelId: "A1",
      levelName: "Beginner",
      previousUnits: [],
      currentUnit: {
        number: 1,
        title: "Meeting people",
        completedLessons: 1,
        totalLessons: 3,
        progress: 1 / 3,
        currentLesson: { id: 1012, number: 2, title: "Introducing yourself" },
      },
      nextUnits: [
        { number: 2, title: "Daily routines" },
        { number: 3, title: "Food and drinks" },
      ],
    };
  },

  async saveResources(
    lessonId: number,
    _payload: SaveResourcesPayload
  ): Promise<SaveResourcesResponse> {
    await delay(700);
    return { lessonId, savedAt: new Date().toISOString() };
  },

  async getPlacementQuestions(): Promise<PlacementQuestion[]> {
    await delay();
    return [
      {
        id: 1,
        prompt: "She ____ to school every day.",
        optionA: "go",
        optionB: "goes",
        optionC: "going",
        optionD: "gone",
        sortOrder: 1,
      },
    ];
  },

  async submitPlacementAttempt(_payload: {
    answers: { questionId: number; selectedOption: string }[];
  }): Promise<PlacementAttemptResponse> {
    await delay();
    return {
      attemptId: 1,
      score: 6,
      totalQuestions: 15,
      assignedLevelId: "A1",
      assignedLevelName: "Beginner",
    };
  },

  async generateSlides(lessonId: number, language = "EN"): Promise<SlideDeck> {
    await delay(900);
    return {
      lessonId,
      cached: false,
      contentVersion: 1,
      language,
      slides: null,
    };
  },

  async updateProgress(
    lessonId: number,
    lastSlideIndex: number
  ): Promise<Progress> {
    await delay();
    return { lessonId, status: "IN_PROGRESS", lastSlideIndex };
  },

  async completeLesson(lessonId: number): Promise<Progress> {
    await delay();
    return { lessonId, status: "COMPLETED", lastSlideIndex: 8 };
  },

  async startPracticeSession(
    lessonId: number,
    gameType: GameType
  ): Promise<PracticeSession> {
    await delay();
    const questions =
      gameType === "QUIZ"
        ? [
            {
              index: 0,
              prompt: "How do you say your name?",
              options: [
                "I am name Sara.",
                "My name is Sara.",
                "Name my Sara.",
                "Me call Sara.",
              ],
            },
          ]
        : [
            {
              index: 0,
              prompt: "She ____ to school every day.",
              options: ["goes", "go", "going", "gone"],
            },
          ];
    return { sessionId: 1, lessonId, gameType, questions };
  },

  async submitPracticeAnswer(
    _sessionId: number,
    questionIndex: number,
    answer: string
  ): Promise<PracticeAnswerResponse> {
    await delay();
    const correct = answer === "My name is Sara." || answer === "goes";
    return {
      questionIndex,
      correct,
      correction: correct ? answer : "goes",
      explanation: "In the present simple, he, she and it need -s.",
    };
  },

  async finishPracticeSession(
    sessionId: number
  ): Promise<PracticeFinishResponse> {
    await delay();
    return {
      sessionId,
      score: 2,
      totalQuestions: 3,
      summary: "Good work.",
    };
  },

  async getWritingTask(lessonId: number): Promise<WritingTask> {
    await delay();
    return {
      lessonId,
      instructions:
        "Write 5 sentences about your daily routine. Use the present simple and at least 5 words from this lesson.",
    };
  },

  async submitWriting(
    lessonId: number,
    text: string
  ): Promise<WritingSubmission> {
    await delay();
    return {
      submissionId: 1,
      lessonId,
      text,
      feedback: "Good work. Two small verb mistakes to fix.",
    };
  },

  async getMistakes(): Promise<StudentMistake[]> {
    await delay();
    return [
      {
        id: 1,
        lessonId: 1012,
        prompt: "She ____ to school every day.",
        studentAnswer: "go",
        correction: "goes",
        explanation: "He, she and it take -s in the present simple.",
        createdAt: new Date().toISOString(),
      },
    ];
  },
};
