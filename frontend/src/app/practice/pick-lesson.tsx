import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

const LESSONS = [
  { label: "Unit 1 · Lesson 1", sub: "Done" },
  { label: "Unit 1 · Lesson 2", sub: "Current" },
  { label: "Unit 2 · Lesson 1", sub: "Locked" },
];

export default function PickLessonScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Practise which lesson?</Text>
        </View>
        {LESSONS.map((l) => (
          <Pressable key={l.label} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{l.label}</Text>
              <Text style={styles.rowSub}>{l.sub}</Text>
            </View>
          </Pressable>
        ))}
        <Button title="Use this lesson" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  row: { padding: 14, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  rowText: { gap: 2 },
  rowLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  rowSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
});
