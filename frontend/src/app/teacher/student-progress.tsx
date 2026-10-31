import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherStudentProgressScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Student progress</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Common mistake</Text>
          <Text style={styles.cardValue}>He, she, it + -s (23 students)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Lessons done</Text>
          <Text style={styles.rowValue}>62%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Avg. quiz score</Text>
          <Text style={styles.rowValue}>71%</Text>
        </View>
        <Button title="Export list" onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  card: { padding: 16, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.board, gap: 4 },
  cardLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  cardValue: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  rowLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text },
  rowValue: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.primaryDark },
});
