import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { usePlacementQuestions, useSubmitPlacement } from "@/src/hooks/usePlacement";
import type { PlacementQuestion } from "@/src/types/api";
import { mapApiError, friendlyMessage } from "@/src/api/errors";

type Phase = "intro" | "question" | "loading" | "result";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "You know the first words and sentences. Next you will learn to introduce yourself and talk about people.",
  A2: "You can handle simple everyday situations. Next you will build fluency in daily routines.",
  B1: "You can manage most everyday conversations. Next you will tackle richer topics and grammar.",
  B2: "You communicate with confidence. Next you will refine accuracy and style.",
  C1: "You are advanced. Next you will polish nuance and professional English.",
};

export default function PlacementScreen() {
  const insets = useSafeAreaInsets();
  const questionsQuery = usePlacementQuestions();
  const submitPlacement = useSubmitPlacement();

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    assignedLevelId: string;
    assignedLevelName: string;
    summary: { en: string; fr: string; ar: string };
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hintLang, setHintLang] = useState<"EN" | "FR" | "AR">("EN");

  const questions: PlacementQuestion[] = questionsQuery.data ?? [];
  const total = questions.length || 15;

  // Submit when entering the loading phase.
  useEffect(() => {
    if (phase !== "loading" || result) return;
    let cancelled = false;
    const payload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? "A",
    }));
    submitPlacement
      .mutateAsync(payload)
      .then((res) => {
        if (cancelled) return;
        setResult({
          score: res.score,
          totalQuestions: res.totalQuestions,
          assignedLevelId: res.assignedLevelId,
          assignedLevelName: res.assignedLevelName,
          summary: res.summary,
        });
        setPhase("result");
      })
      .catch((err) => {
        if (cancelled) return;
        setSubmitError(friendlyMessage(mapApiError(err)));
        setPhase("question");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const currentQuestion = questions[currentIndex];
  const selected = currentQuestion ? answers[currentQuestion.id] : null;

  const handleSelect = (letter: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: letter }));
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("loading");
    }
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError(null);
    setPhase("question");
  };

  const handleRetrySubmit = () => {
    setSubmitError(null);
    setPhase("loading");
  };

  const handleGoToCourse = () => {
    router.replace("/home");
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Student onboarding</Text>
            <Text style={styles.title}>Placement test · intro</Text>
          </View>

          <View style={styles.levelRow}>
            {["A1", "A2", "B1", "C1"].map((l) => (
              <View key={l} style={styles.levelChip}>
                <Text style={styles.levelChipText}>{l}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Let us find your level</Text>
            <Text style={styles.cardBody}>
              A short test so your course starts at the right place. There is no pass or fail.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>questions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>~10</Text>
              <Text style={styles.statLabel}>minutes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>answer each</Text>
            </View>
          </View>

          {questionsQuery.isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Loading questions…</Text>
            </View>
          ) : questionsQuery.isError ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>{friendlyMessage(mapApiError(questionsQuery.error))}</Text>
              <Pressable onPress={() => questionsQuery.refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <Button title="Start the test" onPress={handleStart} />
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Question ───────────────────────────────────────────────────────────────
  if (phase === "question") {
    if (!currentQuestion) {
      return (
        <View style={[styles.root, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      );
    }
    const options = [
      { letter: "A", text: currentQuestion.optionA },
      { letter: "B", text: currentQuestion.optionB },
      { letter: "C", text: currentQuestion.optionC },
      { letter: "D", text: currentQuestion.optionD },
    ];
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => (currentIndex > 0 ? setCurrentIndex((i) => i - 1) : setPhase("intro"))}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.questionCount}>
              {currentIndex + 1} / {questions.length || total}
            </Text>
          </View>

          {submitError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{submitError}</Text>
              <Pressable onPress={handleRetrySubmit}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Choose the correct word</Text>
            <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
          </View>

          {options.map((opt) => (
            <Pressable
              key={opt.letter}
              style={[styles.optionCard, selected === opt.letter && styles.optionCardSelected]}
              onPress={() => handleSelect(opt.letter)}>
              <View style={[styles.optionBadge, selected === opt.letter && styles.optionBadgeSelected]}>
                <Text style={[styles.optionBadgeText, selected === opt.letter && styles.optionBadgeTextSelected]}>
                  {opt.letter}
                </Text>
              </View>
              <Text style={styles.optionText}>{opt.text}</Text>
            </Pressable>
          ))}

          <Button
            title="Next"
            onPress={handleNext}
            disabled={!selected}
          />
        </ScrollView>
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <View style={[styles.root, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingTitle}>Checking your answers…</Text>
        <Text style={styles.loadingBody}>
          We are working out your level. This takes a few seconds.
        </Text>
      </View>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  const levelId = result?.assignedLevelId ?? "A1";
  const description = result?.summary?.[hintLang.toLowerCase() as "en" | "fr" | "ar"]
    ?? LEVEL_DESCRIPTIONS[levelId]
    ?? LEVEL_DESCRIPTIONS.A1;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your level · result</Text>
          <Text style={styles.title}>Your level</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.levelName}>{result?.assignedLevelName ?? "Beginner"}</Text>
          <Text style={styles.scoreText}>
            {result?.score ?? 0} out of {result?.totalQuestions ?? total} correct
          </Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        <View style={styles.langRow}>
          {(["EN", "FR", "AR"] as const).map((lang) => (
            <Pressable
              key={lang}
              style={[styles.langChip, hintLang === lang && styles.langChipSelected]}
              onPress={() => setHintLang(lang)}>
              <Text style={[styles.langChipText, hintLang === lang && styles.langChipTextSelected]}>
                {lang === "EN" ? "English" : lang === "FR" ? "Français" : "العربية"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title="Go to my course" onPress={handleGoToCourse} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, gap: 16 },
  header: { gap: 4 },
  eyebrow: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted, textTransform: "uppercase" },
  title: { fontFamily: Fonts.heading, fontSize: 26, color: Colors.text },
  levelRow: { flexDirection: "row", gap: 8 },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.input,
    backgroundColor: Colors.primaryLight,
  },
  levelChipText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.primaryDark },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 8,
  },
  cardTitle: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text },
  cardBody: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  statValue: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  loadingBox: { alignItems: "center", gap: 8, padding: 24 },
  loadingText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  retryText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primary },
  questionCount: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  sectionLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  questionText: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text, lineHeight: 24 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBadgeSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  optionBadgeText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  optionBadgeTextSelected: { color: Colors.white },
  optionText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text, flex: 1 },
  errorBox: {
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 12,
    gap: 4,
  },
  errorText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  loadingTitle: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text, marginTop: 16 },
  loadingBody: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, marginTop: 8, textAlign: "center", paddingHorizontal: 24 },
  resultCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  levelName: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.primary },
  scoreText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.muted },
  descriptionText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text, lineHeight: 22, textAlign: "center", marginTop: 4 },
  langRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  langChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langChipText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  langChipTextSelected: { color: Colors.primaryDark },
});