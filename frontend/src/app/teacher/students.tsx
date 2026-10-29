import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

interface Student {
  id: number;
  name: string;
  level: string;
  progress: number;
  lastActive: string;
}

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: "Lina B.", level: "A1", progress: 80, lastActive: "Active today" },
  { id: 2, name: "Yacine K.", level: "B1", progress: 45, lastActive: "Active yesterday" },
  { id: 3, name: "Sara M.", level: "A2", progress: 62, lastActive: "Active today" },
  { id: 4, name: "Amine R.", level: "B1", progress: 20, lastActive: "3 days ago" },
  { id: 5, name: "Nour H.", level: "B2", progress: 90, lastActive: "Active today" },
];

const LEVELS = ["All", "A1", "A2", "B1", "B2"];

export default function TeacherStudentsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = MOCK_STUDENTS.filter((s) => {
    if (filter !== "All" && s.level !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>My students</Text>
            <Text style={styles.subtitle}>{MOCK_STUDENTS.length} students</Text>
          </View>
          <View style={styles.iconButton}>
            <Ionicons name="add" size={20} color={Colors.text} />
          </View>
        </View>

        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={20} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students"
            placeholderTextColor={Colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filters}>
          {LEVELS.map((l) => (
            <Pressable
              key={l}
              style={[styles.filterChip, filter === l && styles.filterChipActive]}
              onPress={() => setFilter(l)}>
              <Text style={[styles.filterChipText, filter === l && styles.filterChipTextActive]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8, width: "100%" }}>
          {filtered.map((s) => {
            const open = expanded === s.id;
            return (
              <Pressable
                key={s.id}
                style={styles.studentCard}
                onPress={() => setExpanded(open ? null : s.id)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.studentHeader}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <View style={styles.levelChip}>
                      <Text style={styles.levelChipText}>{s.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.lastActive}>{s.lastActive}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${s.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{s.progress}%</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text} />
                {open ? (
                  <View style={styles.detail}>
                    <Text style={styles.detailText}>Lessons completed: {Math.round(s.progress / 10)}</Text>
                    <Text style={styles.detailText}>Needs review: {s.progress < 50 ? "Yes" : "No"}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1, minHeight: 12 }} />

        <Pressable style={styles.inviteButton}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.inviteButtonText}>Invite students</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: Fonts.bodyHeavy, fontSize: 24, color: Colors.text },
  subtitle: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  searchField: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 16, color: Colors.text },
  filters: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  filterChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterChipText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.text },
  filterChipTextActive: { color: Colors.text },
  studentCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 16, paddingLeft: 10, paddingRight: 14, paddingVertical: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  studentName: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  levelChip: { backgroundColor: Colors.purpleLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 16 },
  levelChipText: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.text },
  lastActive: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  progressText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.muted },
  detail: { width: "100%", paddingTop: 8, gap: 4, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4 },
  detailText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  inviteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12, backgroundColor: Colors.primary },
  inviteButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.white },
});
