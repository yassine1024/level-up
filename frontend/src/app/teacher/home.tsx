import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My lessons</Text>
        <View style={styles.tabs}>
          {["All", "Saved", "Empty"].map((t, i) => (
            <Pressable key={t} style={[styles.tab, i === 0 && styles.tabOn]}>
              <Text style={[styles.tabText, i === 0 && styles.tabTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        {[
          { label: "A1 · U1 · Lesson 2", sub: "Saved · 4 files" },
          { label: "A1 · U1 · Lesson 3", sub: "Empty" },
          { label: "A1 · U2 · Lesson 1", sub: "Saved · 3 files" },
        ].map((l) => (
          <Pressable key={l.label} style={styles.row} onPress={() => router.push("/teacher/lesson-detail")}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{l.label}</Text>
              <Text style={styles.rowSub}>{l.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </Pressable>
        ))}
        <Button title="Add resources" onPress={() => router.push("/teacher/resources")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.chip, backgroundColor: Colors.board },
  tabOn: { backgroundColor: Colors.amber },
  tabText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.muted },
  tabTextOn: { color: Colors.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  rowSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
});
