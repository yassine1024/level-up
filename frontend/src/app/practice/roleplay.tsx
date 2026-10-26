import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";
import { Ionicons } from "@expo/vector-icons";

export default function PracticeRoleplayScreen() {
  const insets = useSafeAreaInsets();
  const characters = [
    { id: "alex", name: "Alex", role: "Best friend", emoji: "😊" },
    { id: "marie", name: "Marie", role: "Teacher", emoji: "📚" },
    { id: "david", name: "David", role: "Hostel manager", emoji: "🏨" },
  ];
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Role-play chat</Text>
          <Chip label="Level A1" variant="amber" />
        </View>
        <Text style={styles.subtitle}>Chat with a character. It fixes your mistakes and explains why.</Text>
        {characters.map((c) => (
          <Pressable key={c.id} style={styles.card} onPress={() => router.push("/practice/character")}>
            <View style={styles.characterBadge}>
              <Text style={styles.characterEmoji}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.characterName}>{c.name}</Text>
              <Text style={styles.characterRole}>{c.role}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.muted} />
          </Pressable>
        ))}
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Meet the character</Text>
        </View>
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
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, marginTop: -4 },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  characterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  characterEmoji: { fontSize: 22 },
  characterName: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  characterRole: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: 2 },
  emptyCard: {
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.muted },
});