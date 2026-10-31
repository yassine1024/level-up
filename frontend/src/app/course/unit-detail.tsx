import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const LESSONS = [
  { label: "✅ Lesson 1 · Greetings", sub: "Done" },
  { label: "▶ Lesson 2 · Introducing yourself", sub: "Current" },
  { label: "🔒 Lesson 3 · Family", sub: "Locked" },
];

export default function UnitDetailScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Unit 1 · Meeting people</Text>
        </View>
        {LESSONS.map((l) => (
          <View key={l.label} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{l.label}</Text>
              <Text style={styles.rowSub}>{l.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text, flex: 1 },
  row: {
    padding: 14,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  rowText: { gap: 2 },
  rowLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  rowSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
});
