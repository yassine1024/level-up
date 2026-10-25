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

export default function PracticeWritingScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id ?? 1012;

  const taskQuery = useWritingTask(lessonId);
  const submitWriting = useSubmitWriting();

  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [corrected, setCorrected] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const res = await submitWriting.mutateAsync({ lessonId, text });
      setFeedback(res.feedback);
      setCorrected(res.text);
    } catch {
      setFeedback("Could not get feedback.");
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
            {taskQuery.data?.instructions ?? "Loading task…"}
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
        {feedback ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Your feedback</Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
            {corrected ? (
              <View style={styles.correctedBox}>
                <Text style={styles.correctedLabel}>Corrected text</Text>
                <Text style={styles.correctedText}>{corrected}</Text>
              </View>
            ) : null}
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
  correctedText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text, lineHeight: 20 },
});