import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

export default function PracticeResultScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/practice/games" as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Fill in the blank</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2 / 3</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>67%</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>Your mistake</Text>
          <Text style={styles.mistakeQuestion}>Question 2</Text>
          <Text style={styles.mistakeText}>She go goes to school every day.</Text>
          <Text style={styles.explanationTitle}>Why?</Text>
          <Text style={styles.explanation}>
            In the present simple, he, she and it need -s: she goes, he plays, it works.
          </Text>
        </View>

        <View style={styles.langOptions}>
          <Text style={styles.lang}>EN</Text>
          <Text style={styles.lang}>FR</Text>
          <Text style={styles.lang}>AR</Text>
        </View>
      </ScrollView>
      <StudentBottomNav active="practice" onCoursePress={() => router.push("/course")} onPracticePress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  title: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  stats: { flexDirection: "row", gap: 24, marginTop: 12 },
  stat: { alignItems: "center" },
  statValue: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.primaryDark },
  statLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 4 },
  mistakeCard: {
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 8,
  },
  mistakeTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.primaryDark },
  mistakeQuestion: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text },
  mistakeText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  explanationTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.primaryDark },
  explanation: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  langOptions: { flexDirection: "row", gap: 16, justifyContent: "center", marginTop: 8 },
  lang: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.primaryDark },
});