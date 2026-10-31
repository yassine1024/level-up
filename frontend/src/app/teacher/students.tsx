import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { BackButton } from "@/components/BackButton";
import { Colors, Fonts, Radii } from "@/constants/theme";
import { teacherApi } from "@/src/api/endpoints";
import type { TeacherStudent } from "@/src/types/api";

function formatLastActive(value: string): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function TeacherStudentsScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["teacher", "students"],
    queryFn: () => teacherApi.getStudents(),
  });

  const students: TeacherStudent[] = query.data ?? [];

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

      {query.isLoading ? (
        <Text style={styles.meta}>Loading students...</Text>
      ) : query.isError ? (
        <Text style={styles.meta}>Could not load students. Check your connection.</Text>
      ) : students.length === 0 ? (
        <Text style={styles.meta}>No students yet.</Text>
      ) : (
        students.map((s) => {
          const open = expanded === s.id;
          return (
            <Pressable
              key={s.id}
              style={styles.card}
              onPress={() => setExpanded(open ? null : s.id)}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.meta}>
                    Level {s.level} · Last active {formatLastActive(s.lastActive)}
                  </Text>
                </View>
                <Text style={styles.progress}>{s.progress}%</Text>
              </View>
              {open ? (
                <View style={styles.detail}>
                  <Text style={styles.detailText}>Progress: {s.progress}%</Text>
                  <Text style={styles.detailText}>Level: {s.level}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })
      )}
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