import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";

const QUESTIONS = [
  {
    prompt: "Where is Sara from?",
    options: [
      { letter: "A", text: "Algiers" },
      { letter: "B", text: "Oran" },
      { letter: "C", text: "Constantine" },
    ],
    correct: "B",
    explanation: "Sara says she is from Oran.",
  },
];

export default function PracticeListeningScreen() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const q = QUESTIONS[current];
  const isCorrect = checked && selected === q.correct;

  const handleCheck = () => {
    if (!selected) return;
    setChecked(true);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Listening</Text>
          <Text style={styles.count}>
            Question {current + 1} of {QUESTIONS.length}
          </Text>
        </View>

        <View style={styles.episodeCard}>
          <View style={styles.episodeRow}>
            <Text style={styles.episodeTitle}>Dialogue at the café</Text>
            <View style={styles.stretchBadge}>
              <Text style={styles.stretchBadgeText}>Stretch</Text>
            </View>
          </View>
          <Pressable style={styles.playButton}>
            <Ionicons name="play" size={18} color={Colors.white} style={{ marginLeft: 2 }} />
            <Text style={styles.playButtonText}>Play audio</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>{q.prompt}</Text>
        </View>

        {q.options.map((opt) => (
          <Pressable
            key={opt.letter}
            style={[
              styles.optionCard,
              selected === opt.letter && styles.optionCardSelected,
              checked && opt.letter === q.correct && styles.optionCardCorrect,
              checked && selected === opt.letter && selected !== q.correct && styles.optionCardWrong,
            ]}
            onPress={() => !checked && setSelected(opt.letter)}>
            <View
              style={[
                styles.optionBadge,
                selected === opt.letter && styles.optionBadgeSelected,
              ]}>
              <Text
                style={[
                  styles.optionBadgeText,
                  selected === opt.letter && styles.optionBadgeTextSelected,
                ]}>
                {opt.letter}
              </Text>
            </View>
            <Text style={styles.optionText}>{opt.text}</Text>
          </Pressable>
        ))}

        {checked ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              {isCorrect ? "Correct!" : `Correct answer: ${q.correct}. ${q.explanation}`}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.primaryButton, (!selected || checked) && styles.primaryButtonDisabled]}
          onPress={checked ? handleNext : handleCheck}
          disabled={!selected}>
          <Text style={styles.primaryButtonText}>
            {checked ? (current < QUESTIONS.length - 1 ? "Next" : "Done") : "Check"}
          </Text>
        </Pressable>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  count: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
  episodeCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 10,
  },
  episodeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  episodeTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  stretchBadge: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.input,
  },
  stretchBadgeText: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.text },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
  },
  playButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.white },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  question: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
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
  optionCardCorrect: { borderColor: "#0A5A40", backgroundColor: "#CDEFDD" },
  optionCardWrong: { borderColor: "#C8401C", backgroundColor: "#FBE4E0" },
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
  feedbackCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: 14,
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
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
});