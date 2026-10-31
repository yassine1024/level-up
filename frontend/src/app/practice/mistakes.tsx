import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useMistakes } from "@/src/hooks/useMistakes";

export default function PracticeMistakesScreen() {
  const insets = useSafeAreaInsets();
  const mistakesQuery = useMistakes();
  const mistakes = mistakesQuery.data ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Your mistakes</Text>
        </View>
        {mistakes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No mistakes yet.</Text>
          </View>
        ) : (
          mistakes.map((m) => (
            <View key={m.id} style={styles.card}>
              <Text style={styles.prompt}>{m.prompt}</Text>
              <Text style={styles.answer}>Your answer: {m.studentAnswer}</Text>
              <Text style={styles.correction}>Correct: {m.correction}</Text>
              <Text style={styles.explanation}>{m.explanation}</Text>
            </View>
          ))
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
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 6,
  },
  prompt: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.text },
  answer: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  correction: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  explanation: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
});