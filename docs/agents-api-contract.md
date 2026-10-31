# Agents API Contract (backend ↔ agents)

The endpoints the Spring Boot backend calls on the agents service. The app never
calls them directly. Design and reasons: [`agents-architecture.md`](agents-architecture.md).

- Base URL: `AGENTS_BASE_URL` (`http://agents:8000` in `infra/compose.yaml`).
- JSON fields are camelCase. The live schema of every endpoint is at `GET /docs`
  on the agents service.
- Set the backend's response timeout for these calls to 45 s.

| Status | Meaning | Backend action |
|---|---|---|
| `200` | Done | Store the result |
| `422` | The request body is wrong, or the model's answer was still invalid after one fix request | Use the current fallback content; `validationProblems` lists what failed |
| `502` | The model call itself failed (provider error, timeout) | Use the current fallback content |
| `503` | No Gemini API key on the agents service | Use the current fallback content |

Shared types:

```jsonc
// Localized: text the student can switch between English, French and Arabic
{ "en": "…", "fr": "…", "ar": "…" }

// Lesson
{ "title": "Introducing yourself", "level": "A1", "unitTitle": "Meeting people" }
```

`level` is one of `A1`, `A2`, `B1`, `B2`, `C1`. `unitTitle` is optional.

## Agent 1 · `POST /api/agents/placement/evaluate`

```json
{
  "questions": [
    {
      "id": 1,
      "prompt": "She ____ to school every day.",
      "correctOption": "B",
      "level": "A1",
      "skill": "grammar",
      "focus": "present simple: he/she/it + -s"
    }
  ],
  "answers": [{ "questionId": 1, "selectedOption": "B" }],
  "unitTitles": { "A1": ["Greetings and Introductions", "Everyday English"] }
}
```

Every question needs exactly one answer. Options are `A`–`D`, in any case.
`unitTitles` is optional: the unit titles of each level, used for "Next you will
learn…".

```json
{
  "score": 7,
  "total": 15,
  "level": "A2",
  "byLevel": [
    { "level": "A1", "correct": 3, "total": 3 },
    { "level": "A2", "correct": 1, "total": 3 }
  ],
  "summary": {
    "en": "You can introduce yourself and talk about your day. Next you will learn to talk about the past.",
    "fr": "…",
    "ar": "…"
  }
}
```

The level comes from code; the model only writes `summary`. If the model fails,
`summary` is a fixed text for the level, so this endpoint does not return `502`.

## Agent 2 · `POST /api/agents/slides/generate`

```json
{
  "lesson": { "title": "Introducing yourself", "level": "A1", "unitTitle": "Meeting people" },
  "vocabularyText": "<text Tika extracted from the Vocabulary file>",
  "grammarText": "<text extracted from the Grammar file>",
  "pronunciationText": "",
  "maxSlides": 10
}
```

At least one of the three texts is required. `maxSlides` is 4–15, default 10.

```json
{
  "slides": [
    {
      "kind": "vocabulary",
      "title": "Say who you are",
      "bullets": ["My name is …", "I am from …", "I am … years old."],
      "example": "Hello! My name is Sara. I am from Oran.",
      "hint": {
        "en": "Use these to tell people about you.",
        "fr": "Je m'appelle … · Je viens de … · J'ai … ans.",
        "ar": "اسمي … · أنا من … · عمري … سنة."
      },
      "miniExercise": { "prompt": "My ____ is Amine.", "options": ["name", "nice", "from"], "answer": "name" }
    }
  ]
}
```

`kind` is `intro`, `vocabulary`, `grammar`, `pronunciation` or `recap`.
`miniExercise` is `null` on intro and recap slides. Store the whole object in
`GeneratedSlideDeck`; it already holds the three hint languages, so one deck per
lesson version serves every student. A slide's position in the list is the
`lastSlideIndex` used for progress.

## Agent 3 · `POST /api/agents/practice/questions`

```json
{
  "lesson": { "title": "Daily routines", "level": "A1" },
  "gameType": "FILL_BLANK",
  "count": 15,
  "vocabularyText": "…",
  "grammarText": "…",
  "pronunciationText": "",
  "listeningTranscript": "",
  "writingDescription": "…",
  "recentMistakes": [
    {
      "prompt": "She ____ to school every day.",
      "studentAnswer": "go",
      "correction": "goes",
      "focus": "present simple: he/she/it + -s"
    }
  ],
  "excludePrompts": ["She ____ to school every day."]
}
```

- `count`: 1–15, default 3.
- `listeningTranscript`: the Listening 1 transcript for `LISTENING_QUIZ` (required
  there), the Listening 2 material for `SPEAKING`.
- `recentMistakes`: up to 50 of the student's latest mistakes. A `focus` that
  appears twice or more is practised again in about a third of the items.
- `excludePrompts`: up to 200 prompts the student has already seen.

```json
{
  "gameType": "FILL_BLANK",
  "items": [
    {
      "index": 0,
      "prompt": "She ____ to school every day.",
      "options": ["going", "goes", "gone", "go"],
      "correctAnswer": "goes",
      "acceptedAnswers": [],
      "explanation": { "en": "With he, she or it, the verb takes -s.", "fr": "…", "ar": "…" },
      "focus": "present simple: he/she/it + -s",
      "audioText": null
    }
  ]
}
```

| `gameType` | `options` | Grading |
|---|---|---|
| `QUIZ` | 4 answers, shuffled | case-insensitive equality |
| `FILL_BLANK` | 3–4 words, shuffled; the prompt has one `____` | case-insensitive equality |
| `LISTENING_QUIZ` | 3–4 answers, shuffled | case-insensitive equality |
| `TRUE_FALSE` | `["True", "False"]` | case-insensitive equality |
| `WORD_MATCH`, `MEMORY_CARDS` | empty: the board pairs every `prompt` with every `correctAnswer` | case-insensitive equality |
| `WORD_SCRAMBLE` | the letters of `correctAnswer`, shuffled | case-insensitive equality |
| `SPELLING_BEE` | empty; the app reads `audioText` aloud | case-insensitive equality |
| `SPEAKING` | empty | `practice/check-answer` |

Send the app only `index`, `prompt`, `options` and `audioText` (and for the match
games, the list of `correctAnswer` values for the board). Keep the rest on the
server. Save `focus` with each mistake so it can come back in `recentMistakes`.

## Agent 3 · `POST /api/agents/practice/check-answer`

For answers the student types or speaks freely.

```json
{
  "level": "A1",
  "prompt": "Where are you from?",
  "correctAnswer": "I am from Oran.",
  "acceptedAnswers": [],
  "studentAnswer": "I from Algiers",
  "spoken": true
}
```

```json
{
  "correct": false,
  "correction": "I am from Algiers.",
  "explanation": { "en": "With I, use am.", "fr": "…", "ar": "…" },
  "focus": "verb to be"
}
```

A correct answer returns `{ "correct": true, "correction": null, "explanation": null, "focus": null }`.
Answers equal to `correctAnswer` or `acceptedAnswers` after normalising case,
punctuation and contractions are graded without calling the model.

## Agent 3 · `POST /api/agents/writing/feedback`

```json
{
  "lesson": { "title": "Daily routines", "level": "A1" },
  "task": "Write 5 sentences about your daily routine. Use the present simple.",
  "studentText": "I wake up at 7. My friend Sara study with me. We eats lunch together.",
  "vocabularyText": "wake up, bus, lunch"
}
```

`vocabularyText` is optional. `studentText` is at most 5000 characters.

```json
{
  "headline": "Good work",
  "comment": { "en": "Clear ideas. Two small verb mistakes to fix.", "fr": "…", "ar": "…" },
  "correctedText": "I wake up at 7. My friend Sara studies with me. We eat lunch together.",
  "mistakes": [
    {
      "sentence": "My friend Sara study with me.",
      "wrong": "study",
      "right": "studies",
      "category": "Verb form",
      "explanation": { "en": "He, she and it take -s or -es in the present simple.", "fr": "…", "ar": "…" },
      "focus": "present simple: he/she/it + -s"
    }
  ],
  "correctedSegments": [
    { "text": "I wake up at 7. My friend Sara", "change": "same" },
    { "text": "study", "change": "removed" },
    { "text": "studies", "change": "added" },
    { "text": "with me. We", "change": "same" },
    { "text": "eats", "change": "removed" },
    { "text": "eat", "change": "added" },
    { "text": "lunch together.", "change": "same" }
  ]
}
```

Render `correctedSegments` in order, separated by spaces: `removed` struck
through, `added` highlighted. Save each mistake as a `StudentMistake`
(`prompt` = `sentence`, `studentAnswer` = `wrong`, `correction` = `right`).

## Agent 4 · `POST /api/agents/character/episode`

```json
{
  "lesson": { "title": "Food and drinks", "level": "A1" },
  "characterRole": "cousin",
  "scenario": "At a family dinner",
  "otherText": "<text extracted from the Other file>",
  "otherDescription": "Topic for the character chat: what did you have for dinner last night?",
  "vocabularyText": "…",
  "grammarText": "…"
}
```

`characterRole` (default `friend`, at most 40 characters) and `scenario` (at most
300) are the student's choices. At least one of the four texts is required.

```json
{
  "title": "Dinner talk with Yasmine",
  "setting": "You and Yasmine are at the table. She wants to know about your evening.",
  "character": { "name": "Yasmine", "role": "your cousin", "personality": "Curious and cheerful." },
  "goals": ["Food words", "Past simple", "Present simple"],
  "targetWords": ["chicken", "rice", "cook", "spicy", "dinner"],
  "openingLine": "Hi! I am Yasmine. What did you have for dinner last night?"
}
```

Store the episode. Its `openingLine` is the first message of the conversation.

## Agent 4 · `POST /api/agents/character/reply`

```json
{
  "level": "A1",
  "episode": { "…": "the episode object above, unchanged" },
  "history": [
    { "role": "character", "text": "Hi! I am Yasmine. What did you have for dinner last night?" },
    { "role": "student", "text": "I had chicken and rice." },
    { "role": "character", "text": "Nice! Did you cook it yourself?" }
  ],
  "studentMessage": "No. I eat chicken and rice yesterday.",
  "spoken": false,
  "allowedModes": ["type"],
  "maxTurns": 10
}
```

- `history`: up to 40 earlier messages, oldest first, without `studentMessage`.
- `spoken`: `true` when `studentMessage` is a speech-to-text transcript.
- `allowedModes`: any of `type`, `record`, `choose_and_record`. The MVP sends
  `["type"]`.
- `maxTurns`: the episode ends on this student message (default 10).

```json
{
  "reply": "Yum! Was it spicy?",
  "emotion": "happy",
  "correction": {
    "original": "I eat chicken and rice yesterday.",
    "corrected": "I ate chicken and rice yesterday.",
    "explanation": { "en": "For yesterday, use the past simple: eat becomes ate.", "fr": "…", "ar": "…" },
    "focus": "past simple: irregular verbs",
    "segments": [
      { "text": "I", "change": "same" },
      { "text": "eat", "change": "removed" },
      { "text": "ate", "change": "added" },
      { "text": "chicken and rice yesterday.", "change": "same" }
    ]
  },
  "nextInput": { "mode": "type", "suggestions": [] },
  "episodeComplete": false
}
```

- `correction` is `null` when the message has no mistake worth fixing.
- `emotion` is `neutral`, `happy`, `surprised`, `thinking` or `encouraging`; the
  app uses it to animate the character.
- `nextInput.mode` is how the student answers next. For `choose_and_record`,
  `suggestions` has three answers to pick from before recording.
- Append `studentMessage` and `reply` to the history. Save `correction` as a
  `StudentMistake`.

## Speech tool · `POST /api/agents/speech/transcribe`

`multipart/form-data` with one part, `audio`: WAV, MP3, AIFF, AAC, OGG, FLAC, M4A
(`audio/m4a`, `audio/x-m4a`, `audio/mp4`), Opus or WebM, at most 10 MB.
Unsupported types return `415`, larger files `413`, empty files `400`.

```json
{ "text": "no i eat chicken and rice yesterday", "language": "en" }
```

The transcript keeps the student's mistakes. `text` is empty when nobody speaks.
When `language` is not `en`, ask the student to answer in English. Otherwise send
`text` on to `practice/check-answer` or `character/reply` with `spoken: true`.

## Metadata (Phase 4)

Every generating endpoint now returns an extra `meta` field alongside its existing fields. The field is optional and may be `null` when generation did not run (for example placement falling back to a fixed summary).

```jsonc
"meta": {
  "attempts": 1,                 // 1 = accepted first try, 2 = accepted after retry
  "validationProblems": [],      // problems found at each attempt (empty on first-try success)
  "model": "gemini-3.5-flash-lite",
  "latencyMs": 1234,
  "tokenUsage": 567              // provider-reported token count, when available
}
```

On a `422` response the body contains `validationProblems` (a list of strings) describing the final failure, so the backend can store it even without a usable output.
