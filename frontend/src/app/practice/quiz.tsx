import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useCourse } from "@/src/hooks/useCourse";
import {
  useStartPracticeSession,
  useSubmitPracticeAnswer,
  useFinishPracticeSession,
} from "@/src/hooks/usePracticeSession";

export default function PracticeQuizScreen() {
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startSession
      .mutateAsync({ lessonId, gameType: "QUIZ" })
      .then((session) => {
        if (cancelled) return;
        setSessionId(session.sessionId);
        setQuestions(
          session.questions.map((q) => ({ prompt: q.prompt, options: q.options }))
        );
      })
      .catch(() => {
        // Keep screen usable with empty state on failure.
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, startSession]);

  const currentQuestion = questions[current];

  const handleCheck = async () => {
    if (!sessionId || !selected) return;
    try {
      const res = await submitAnswer.mutateAsync({
        sessionId,
        questionIndex: current,
        answer: selected,
      });
      setFeedback(res.explanation);
      setCorrectAnswer(res.correction);
    } catch {
      setFeedback("Could not check answer.");
    }
  };

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setFeedback(null);
      setCorrectAnswer(null);
    } else if (sessionId) {
      try {
        const res = await finishSession.mutateAsync(sessionId);
        router.push({
          pathname: "/practice/result",
          params: { score: String(res.score), total: String(res.totalQuestions) },
        });
      } catch {
        router.push("/practice/result");
      }
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Quiz</Text>
          <Text style={styles.questionCount}>
            {questions.length ? `${current + 1} / ${questions.length}` : "…"}
          </Text>
        </View>
        {currentQuestion ? (
          <>
            <View style={styles.card}>
              <Text style={styles.question}>{currentQuestion.prompt}</Text>
            </View>
            {currentQuestion.options.map((opt, i) => (
              <Pressable
                key={i}
                style={[
                  styles.optionCard,
                  selected === opt && styles.optionCardSelected,
                ]}
                onPress={() => setSelected(opt)}>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
            {feedback ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>
                  {correctAnswer ? `Correct answer: ${correctAnswer}. ` : ""}
                  {feedback}
                </Text>
              </View>
            ) : null}
            <Pressable
              style={styles.primaryButton}
              onPress={feedback ? handleNext : handleCheck}>
              <Text style={styles.primaryButtonText}>
                {feedback ? "Next" : "Check"}
              </Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicatorPlaceholder />
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

function ActivityIndicatorPlaceholder() {
  return (
    <View style={{ padding: 24, alignItems: "center" }}>
      <Text style={{ color: Colors.muted }}>Loading questions…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  questionCount: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  question: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  optionCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text },
  feedbackCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  feedbackText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.primaryDark, lineHeight: 20 },
  primaryButton: {
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
});