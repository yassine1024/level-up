import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";

export default function PracticeGamesScreen() {
  const insets = useSafeAreaInsets();
  const games = [
    { key: "quiz", title: "Quiz", sub: "Choose the right answer", count: "3 questions" },
    { key: "fill", title: "Fill in the blank", sub: "Complete the sentence", count: "3 questions" },
    { key: "match", title: "Word match", sub: "More games later", count: "Soon" },
  ];
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice course</Text>
          <Chip label="Level A1" variant="amber" />
        </View>
        <View style={styles.tabs}>
          {["Speaking", "Writing", "Listening", "Practising"].map((t, i) => (
            <View key={t} style={[styles.tab, i === 3 && styles.tabOn]}>
              <Text style={[styles.tabText, i === 3 && styles.tabTextOn]}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.unit}>Unit 1 · Lesson 2</Text>
        <Text style={styles.pick}>Pick a game</Text>
        {games.map((g) => (
          <Pressable key={g.key} style={styles.gameCard} onPress={() => router.push("/practice/quiz" as any)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{g.title}</Text>
              <Text style={styles.gameSub}>{g.sub}</Text>
            </View>
            <Text style={styles.gameCount}>{g.count}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <StudentBottomNav active="practice" onCoursePress={() => router.push("/course")} onPracticePress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  tabs: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.cardBorder },
  tabOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  tabTextOn: { color: Colors.white },
  unit: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.primaryDark, marginTop: 4 },
  pick: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  gameCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gameTitle: { fontFamily: Fonts.heading, fontSize: 17, color: Colors.text },
  gameSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: 2 },
  gameCount: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.primaryDark },
});