import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherLessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Lesson {id ?? 2} · Introducing yourself</Text>
        </View>
        {["Vocabulary", "Grammar", "Listening 1"].map((label) => (
          <View key={label} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primaryDark} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowSub}>{label.toLowerCase().replace(" ", "_")}.pdf</Text>
            </View>
          </View>
        ))}
        <Button title="Preview slides" onPress={() => router.push("/teacher/lesson-preview")} />
        <Button title="Edit resources" onPress={() => router.push("/teacher/edit-resource")} />
        <Pressable style={styles.danger} onPress={() => {}}>
          <Text style={styles.dangerText}>Delete lesson</Text>
        </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.board, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  rowSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  danger: { marginTop: 8, padding: 14, borderRadius: Radii.card, backgroundColor: Colors.errorBg, alignItems: "center" },
  dangerText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.errorText },
});
