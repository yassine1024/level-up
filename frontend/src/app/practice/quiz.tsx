import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function PracticeQuizScreen() {
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams();
  const [current, setCurrent] = useState(1);
  const questions = [
    { q: "How do you say your name?", a: "My name is Sara.", options: ["I am name Sara.", "My name is Sara.", "Name my Sara.", "Me call Sara."] },
    { q: "What is your favorite color?", a: "My favorite color is blue.", options: ["I like blue.", "Blue is my favorite.", "My favorite color is blue.", "I love blue."] },
    { q: "Where do you live?", a: "I live in Paris.", options: ["I in Paris live.", "I live Paris.", "I live in Paris.", "Paris my house."] },
  ];
  const total = questions.length;
  const correct = current - 1;
  const handleAnswer = (selected: string) => {};
  const hasNext = current < total;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Quiz</Text>
          <Text style={styles.questionCount}>{current} / {total}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.question}>{questions[current - 1]?.q}</Text>
        </View>
        {questions[current - 1]?.options.map((opt, i) => (
          <Pressable key={i} style={styles.optionCard} onPress={() => handleAnswer(opt)}>
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
        {current === 1 && questions[current - 1]?.a === questions[0].a && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>Correct answer: goes. With he, she or it we add -s to the verb.</Text>
          </View>
        )}
      </ScrollView>
      <StudentBottomNav active="practice" onCoursePress={() => router.push("/course")} onPracticePress={() => {}} />
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
  optionText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.text },
  feedbackCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  feedbackText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.primaryDark, lineHeight: 20 },
});