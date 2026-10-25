import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";

const options = ["goes", "go", "going", "gone"];

export default function PracticeFillBlankScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const sentence = "She _____ to school every day.";
  const correctAnswer = "goes";

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (!showFeedback) setShowFeedback(true);
    else router.push("/practice/result" as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Fill in the blank</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>{sentence.replace("_____", selected ?? "")}</Text>
        </View>
        <View style={styles.options}>
          {options.map((opt) => (
            <Pressable key={opt} style={[styles.option, selected === opt && styles.optionSelected]} onPress={() => handleSelect(opt)}>
              <Text style={selected === opt ? styles.optionTextSelected : styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        {showFeedback && selected && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              {selected === correctAnswer ? "Correct!" : "Not quite"}
            </Text>
            {selected !== correctAnswer && (
              <Text style={styles.feedbackText}>Correct answer: {correctAnswer}. With he, she or it we add -s to the verb.</Text>
            )}
          </View>
        )}
        <Pressable style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>{showFeedback && selected ? "Continue" : "Check"}</Text>
        </Pressable>
      </ScrollView>
      <StudentBottomNav active="practice" onCoursePress={() => router.push("/course")} onPracticePress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  title: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text, marginLeft: -24 },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  question: { fontFamily: Fonts.body, fontSize: 16, color: Colors.muted },
  options: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  option: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.muted },
  optionTextSelected: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  feedbackCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  feedbackTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  feedbackText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.primaryDark, marginTop: 6, lineHeight: 18 },
  primaryButton: {
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
});