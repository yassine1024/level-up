import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { BackButton } from "@/components/BackButton";
import { Colors, Fonts, Radii } from "@/constants/theme";

interface Student {
  id: number;
  name: string;
  level: string;
  progress: number; // 0-100
  lastActive: string;
}

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: "Amina", level: "A2", progress: 72, lastActive: "Today" },
  { id: 2, name: "Youssef", level: "A1", progress: 34, lastActive: "Yesterday" },
  { id: 3, name: "Sara", level: "B1", progress: 88, lastActive: "2 days ago" },
  { id: 4, name: "Omar", level: "A2", progress: 51, lastActive: "3 days ago" },
];

export default function TeacherStudentsScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Students</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.subtitle}>Students enrolled in your course.</Text>

      {MOCK_STUDENTS.map((s) => {
        const open = expanded === s.id;
        return (
          <Pressable
            key={s.id}
            style={styles.card}
            onPress={() => setExpanded(open ? null : s.id)}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{s.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.meta}>
                  Level {s.level} · Last active {s.lastActive}
                </Text>
              </View>
              <Text style={styles.progress}>{s.progress}%</Text>
            </View>
            {open ? (
              <View style={styles.detail}>
                <Text style={styles.detailText}>Progress: {s.progress}%</Text>
                <Text style={styles.detailText}>Lessons completed: {Math.round(s.progress / 10)}</Text>
                <Text style={styles.detailText}>Needs review: {s.progress < 50 ? "Yes" : "No"}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 12, backgroundColor: Colors.background, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, marginBottom: 8 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    gap: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.primaryDark },
  name: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  meta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  progress: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  detail: { paddingTop: 8, gap: 4, borderTopWidth: 1, borderTopColor: Colors.cardBorder, marginTop: 4 },
  detailText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
});
