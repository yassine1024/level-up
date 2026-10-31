import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useCourse } from "@/src/hooks/useCourse";
import { mapApiError, friendlyMessage, TAKE_A_MOMENT_MESSAGE } from "@/src/api/errors";
import {
  useStartPracticeSession,
  useSubmitPracticeAnswer,
  useFinishPracticeSession,
} from "@/src/hooks/usePracticeSession";

export default function PracticeFillBlankScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id ?? 1012;

  const startSession = useStartPracticeSession();
  const submitAnswer = useSubmitPracticeAnswer();
  const finishSession = useFinishPracticeSession();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<
    { prompt: string; options: string[] }[]
  >([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startSession
      .mutateAsync({ lessonId, gameType: "FILL_BLANK" })
      .then((session) => {
        if (cancelled) return;
        setSessionId(session.sessionId);
        setQuestions(
          session.questions.map((q) => ({ prompt: q.prompt, options: q.options }))
        );
      })
      .catch((err) => {
        setStartError(friendlyMessage(mapApiError(err)));
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, startSession]);

  const currentQuestion = questions[current];

  const handleSelect = (opt: string) => {
    if (showFeedback) return;
    setSelected(opt);
  };

  const handleCheck = async () => {
    if (!sessionId || !selected || showFeedback) return;
    try {
      const res = await submitAnswer.mutateAsync({
        sessionId,
        questionIndex: current,
        answer: selected,
      });
      setCorrectAnswer(res.correction);
      setFeedback(res.explanation);
      setShowFeedback(true);
    } catch (err) {
      setFeedback(friendlyMessage(mapApiError(err)));
      setShowFeedback(true);
    }
  };

  const handleContinue = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
      setFeedback(null);
      setCorrectAnswer(null);
    } else if (sessionId) {
      try {
        await finishSession.mutateAsync(sessionId);
      } catch {
        // ignore
      }
      router.push("/practice/result");
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Fill in the blank</Text>
          <Text style={styles.count}>
            {questions.length ? `${current + 1} / ${questions.length}` : "…"}
          </Text>
        </View>
        {currentQuestion ? (
          <>
            <View style={styles.card}>
              <Text style={styles.question}>{currentQuestion.prompt}</Text>
            </View>
            <View style={styles.optionsRow}>
              {currentQuestion.options.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.option,
                    selected === opt && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(opt)}>
                  <Text
                    style={
                      selected === opt ? styles.optionTextSelected : styles.optionText
                    }>
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
            {showFeedback ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>
                  {selected === correctAnswer ? "Correct" : "Not quite"}
                </Text>
                <Text style={styles.feedbackText}>
                  Correct answer: {correctAnswer}.{" "}
                  {feedback ?? "With he, she or it we add -s to the verb."}
                </Text>
                <Pressable style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.checkButton} onPress={handleCheck}>
                <Text style={styles.checkButtonText}>Check</Text>
              </Pressable>
            )}
          </>
        ) : (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: Colors.muted }}>
              {startError ?? "Loading questions…"}
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 13 }}>{TAKE_A_MOMENT_MESSAGE}</Text>
          </View>
        )}
      </ScrollView>
      <StudentBottomNav
        active="practice"
        onCoursePress={() => router.navigate("/course")}
        onPracticePress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  count: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  question: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text },
  optionTextSelected: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.primaryDark },
  feedbackCard: {
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 8,
  },
  feedbackTitle: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.text },
  feedbackText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, lineHeight: 20 },
  checkButton: {
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
  continueButton: {
    height: 48,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
});