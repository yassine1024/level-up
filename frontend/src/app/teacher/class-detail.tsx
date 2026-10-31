import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

const STUDENTS = [
  { name: "Sara B.", progress: "Unit 1 · 80%" },
  { name: "Amine K.", progress: "Unit 1 · 45%" },
];

export default function TeacherClassDetailScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Class A · A1</Text>
        </View>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Join code</Text>
          <Text style={styles.code}>LSN-4821</Text>
        </View>
        {STUDENTS.map((s) => (
          <View key={s.name} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{s.name}</Text>
              <Text style={styles.rowSub}>{s.progress}</Text>
            </View>
          </View>
        ))}
        <Button title="Share code" onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text },
  codeCard: { padding: 16, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.board, gap: 4 },
  codeLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  code: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
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
