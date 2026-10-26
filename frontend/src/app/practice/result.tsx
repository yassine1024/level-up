import { View, StyleSheet, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

export default function PracticeResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const score = Number(params.score ?? 2);
  const total = Number(params.total ?? 3);
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Result</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{score} / {total}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{percent}%</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/practice/games")}>
            <Text style={styles.primaryButtonText}>Play again</Text>
          </Pressable>
          <Pressable
            style={styles.ghostButton}
            onPress={() => router.replace("/practice")}>
            <Text style={styles.ghostButtonText}>Back to games</Text>
          </Pressable>
        </View>
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
  actions: { gap: 12 },
  primaryButton: {
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
  ghostButton: {
    height: 54,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.primaryDark },
});