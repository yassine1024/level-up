import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { usePlacementQuestions, useSubmitPlacement } from "@/src/hooks/usePlacement";
import type { PlacementQuestion } from "@/src/types/api";

type Phase = "intro" | "question" | "loading" | "result";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "You know the first words and sentences. Next you will learn to introduce yourself and talk about people.",
  A2: "You can handle simple everyday situations. Next you will build fluency in daily routines.",
  B1: "You can manage most everyday conversations. Next you will tackle richer topics and grammar.",
  B2: "You communicate with confidence. Next you will refine accuracy and style.",
  C1: "You are advanced. Next you will polish nuance and professional English.",
};

export default function PlacementScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isRetake = params.mode === "retake";
  const insets = useSafeAreaInsets();
  const questionsQuery = usePlacementQuestions();
  const submitPlacement = useSubmitPlacement();

  const [phase, setPhase] = useState<Phase>(isRetake ? "question" : "intro");
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
      .catch(() => {
        if (cancelled) return;
        setSubmitError("Could not compute your level. Try again.");
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
        <View style={styles.introHeader}>
          <View style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </View>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroImage} />
        </View>
        <View style={styles.introText}>
          <Text style={styles.introTitle}>Let&apos;s find your level</Text>
          <Text style={styles.introBody}>Answer a few quick questions so we can start you at the right place.</Text>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="time-outline" size={22} color={Colors.text} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.infoTitle}>About 10 minutes</Text>
              <Text style={styles.infoBody}>Take your time, no rush</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.purpleLight }]}>
              <Ionicons name="list-outline" size={22} color={Colors.text} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.infoTitle}>Multiple choice</Text>
              <Text style={styles.infoBody}>Pick the best answer each time</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: "#FCE3C4" }]}>
              <Ionicons name="happy-outline" size={22} color={Colors.text} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.infoTitle}>No pressure</Text>
              <Text style={styles.infoBody}>It is not graded, it just places you</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start test</Text>
          </Pressable>
          <Text style={styles.maybeLater}>Maybe later</Text>
        </View>
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

        {isRetake ? (
          <View style={styles.resultCard}>
            <Text style={styles.scoreText}>Previous level: A1 · New level: {result?.assignedLevelName ?? "Beginner"}</Text>
          </View>
        ) : null}
        {isRetake ? (
          <View style={styles.resultCard}>
            <Text style={styles.scoreText}>Previous level: A1 · New level: {result?.assignedLevelName ?? "Beginner"}</Text>
          </View>
        ) : null}
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

  introHeader: { paddingHorizontal: 24, paddingTop: 24, height: 40, justifyContent: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center" },
  hero: { alignItems: "center", marginTop: 24 },
  heroImage: { width: 125, height: 125, borderRadius: 62.5, backgroundColor: Colors.primaryLight },
  introText: { alignItems: "center", paddingHorizontal: 24, marginTop: 24, gap: 8 },
  introTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 28, color: Colors.text, textAlign: "center", lineHeight: 36 },
  introBody: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.muted, textAlign: "center", lineHeight: 22 },
  infoList: { paddingHorizontal: 24, marginTop: 24, gap: 12 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingLeft: 12, paddingRight: 16, paddingVertical: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  infoTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  infoBody: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  actions: { position: "absolute", left: 24, right: 24, top: 696, alignItems: "center", gap: 12 },
  startButton: { width: "100%", height: 52, borderRadius: 16, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  startButtonText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  maybeLater: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.muted },
});