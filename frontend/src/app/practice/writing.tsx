import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Button } from "@/components/Button";
import { TextArea } from "@/components/TextArea";
import { Ionicons } from "@expo/vector-icons";
import { useCourse } from "@/src/hooks/useCourse";
import { useWritingTask, useSubmitWriting } from "@/src/hooks/useWriting";
import { mapApiError, friendlyMessage, TAKE_A_MOMENT_MESSAGE } from "@/src/api/errors";

export default function PracticeWritingScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id ?? 1012;

  const taskQuery = useWritingTask(lessonId);
  const submitWriting = useSubmitWriting();

  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [corrected, setCorrected] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<
    { category: string; sentence: string; wrong: string; right: string; explanation: string }[]
  >([]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const res = await submitWriting.mutateAsync({ lessonId, text });
      setFeedback(res.feedback);
      setCorrected(res.correctedText ?? res.text);
      setCorrections(res.corrections ?? []);
    } catch (err) {
      setFeedback(friendlyMessage(mapApiError(err)));
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Writing</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Your task</Text>
          <Text style={styles.task}>
            {taskQuery.isError
              ? friendlyMessage(mapApiError(taskQuery.error))
              : taskQuery.data?.instructions ?? "Loading task…"}
          </Text>
        </View>
        <TextArea
          label="Your answer"
          value={text}
          onChangeText={setText}
          placeholder="Write your sentences here…"
          minHeight={120}
        />
        <Text style={styles.wordCount}>{text.trim().split(/\s+/).filter(Boolean).length} words</Text>
        <Button
          title={submitWriting.isPending ? "Sending…" : "Send for feedback"}
          onPress={handleSubmit}
          disabled={submitWriting.isPending || !text.trim()}
        />
        {submitWriting.isPending ? (
          <Text style={styles.loadingHint}>{TAKE_A_MOMENT_MESSAGE}</Text>
        ) : null}
        {feedback ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackHeadline}>Good work</Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
            {corrected ? (
              <View style={styles.correctedBox}>
                <Text style={styles.correctedLabel}>Corrected text</Text>
                <Text style={styles.correctedText}>
                  {renderCorrected(corrected)}
                </Text>
              </View>
            ) : null}
            {corrections.map((c, i) => (
              <View key={i} style={styles.mistakeCard}>
                <View style={styles.mistakeHeader}>
                  <View style={styles.mistakeChip}>
                    <Text style={styles.mistakeChipText}>{c.category}</Text>
                  </View>
                  <Text style={styles.mistakeDate}>Today</Text>
                </View>
                <Text style={styles.mistakeSentence}>{c.sentence}</Text>
                <View style={styles.mistakeDiff}>
                  <Text style={styles.wrongWord}>{c.wrong}</Text>
                  <Text style={styles.diffArrow}> </Text>
                  <Text style={styles.rightWord}>{c.right}</Text>
                </View>
                <Text style={styles.mistakeExplanation}>{c.explanation}</Text>
              </View>
            ))}
            <Pressable style={styles.ghostButton} onPress={() => { setText(""); setFeedback(null); setCorrected(null); setCorrections([]); }}>
              <Text style={styles.ghostButtonText}>Try another task</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <StudentBottomNav
        active="practice"
        onCoursePress={() => router.push("/course")}
        onPracticePress={() => {}}
      />
    </View>
  );
}

function renderCorrected(input: string) {
  const parts = input.split(/(\{\{w:.*?\}\}|\{\{r:.*?\}\})/g);
  return parts.map((part, i) => {
    const wm = part.match(/^\{\{w:(.*)\}\}$/);
    if (wm) {
      return (
        <Text key={i} style={styles.wrongInline}>
          {wm[1]}
        </Text>
      );
    }
    const rm = part.match(/^\{\{r:(.*)\}\}$/);
    if (rm) {
      return (
        <Text key={i} style={styles.rightInline}>
          {rm[1]}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 8,
  },
  label: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  task: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text, lineHeight: 22 },
  wordCount: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, textAlign: "right" },
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
  correctedBox: { marginTop: 8, gap: 4 },
  correctedLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text },
  correctedText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text, lineHeight: 22 },
  feedbackHeadline: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.primaryDark },
  wrongInline: {
    color: "#C8401C",
    textDecorationLine: "line-through",
    fontFamily: Fonts.body,
  },
  rightInline: {
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    fontFamily: Fonts.bodyHeavy,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  mistakeCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
    gap: 6,
  },
  mistakeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mistakeChip: {
    backgroundColor: Colors.board,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.input,
  },
  mistakeChipText: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  mistakeDate: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  mistakeSentence: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  mistakeDiff: { flexDirection: "row", alignItems: "center", gap: 6 },
  wrongWord: { fontFamily: Fonts.body, fontSize: 14, color: "#C8401C", textDecorationLine: "line-through" },
  diffArrow: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  rightWord: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  mistakeExplanation: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  ghostButton: {
    height: 44,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  loadingHint: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, textAlign: "center" },
});