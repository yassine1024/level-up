import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

const TABS = ["Speaking", "Writing", "Listening", "Practising"] as const;
type Tab = (typeof TABS)[number];

const GAMES: Record<Tab, { key: string; title: string; sub: string; count: string; route: string; locked?: boolean }[]> = {
  Speaking: [{ key: "speaking", title: "Speaking", sub: "Coming soon", count: "Soon", route: "", locked: true }],
  Writing: [
    { key: "fill", title: "Fill in the blank", sub: "Complete the sentence", count: "3 questions", route: "/practice/fill-blank" },
  ],
  Listening: [{ key: "listening", title: "Listening", sub: "Coming soon", count: "Soon", route: "/practice/listening", locked: true }],
  Practising: [
    { key: "quiz", title: "Quiz", sub: "Coming soon", count: "Soon", route: "/practice/quiz", locked: true },
    { key: "grammar-crush", title: "Grammar Crush", sub: "Match and learn grammar", count: "Play", route: "/practice/grammar-crush" },
  ],
};

export default function PracticeGamesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("Practising");
  const games = GAMES[tab];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice course</Text>
        </View>
        <View style={styles.tabs}>
          {TABS.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
              {i < TABS.length - 1 ? <View style={styles.tabDivider} /> : null}
            </Pressable>
          ))}
        </View>
        <Text style={styles.unit}>Unit 1 · Lesson 2</Text>
        <Text style={styles.pick}>Pick a game</Text>
        {games.map((g) => (
          <Pressable
            key={g.key}
            style={[styles.gameCard, g.locked && styles.gameCardLocked]}
            onPress={() => {
              if (g.locked) return;
              if (g.key === "quiz") router.push("/practice/quiz");
              else if (g.key === "fill") router.push("/practice/fill-blank");
              else if (g.key === "listening") router.push("/practice/listening");
              else if (g.key === "grammar-crush") router.push("/practice/grammar-crush");
            }}
            disabled={g.locked}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{g.title}</Text>
              <Text style={styles.gameSub}>{g.sub}</Text>
            </View>
            <Text style={styles.gameCount}>{g.count}</Text>
          </Pressable>
        ))}
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
  header: { marginBottom: 4 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  tabs: { flexDirection: "row", borderBottomWidth: 2, borderColor: Colors.cardBorder },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, position: "relative" },
  tabText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  tabTextOn: { fontFamily: Fonts.bodyHeavy, color: Colors.text },
  tabDivider: { position: "absolute", right: 0, top: 8, bottom: 8, width: 1, backgroundColor: Colors.cardBorder },
  unit: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted, marginTop: 4 },
  pick: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.text },
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
  gameCardLocked: { opacity: 0.5 },
  gameTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  gameSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: 2 },
  gameCount: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
});