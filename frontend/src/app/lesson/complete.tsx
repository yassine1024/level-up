import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

export default function LessonCompleteScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 34 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.mascot} />
      <View style={styles.unitChip}>
        <Text style={styles.unitChipText}>Unit 2 · Food & Drinks</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Unit completed!</Text>
        <Text style={styles.body}>Great job, Asma! You learned new words and practiced the rules.</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={20} color={Colors.text} />
          </View>
          <Text style={styles.statValue}>+50 XP</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statCardBlue}>
          <View style={styles.statIcon}>
            <Ionicons name="book-outline" size={20} color={Colors.text} />
          </View>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>New words</Text>
        </View>
        <View style={styles.statCardCream}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy-outline" size={20} color={Colors.text} />
          </View>
          <Text style={styles.statValue}>92%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>
      <View style={styles.nextCard}>
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>3</Text>
        </View>
        <View style={{ flex: 1, gap: 0 }}>
          <Text style={styles.nextLabel}>Next up</Text>
          <Text style={styles.nextTitle}>Unit 3 · Travel & Places</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text} />
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <View style={styles.actions}>
        <Pressable style={styles.continueButton} onPress={() => router.replace("/home")}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
        <Text style={styles.reviewText}>Review the unit</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, backgroundColor: Colors.background, paddingHorizontal: 24, gap: 14, alignItems: "center" },
  mascot: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primaryLight },
  unitChip: { backgroundColor: Colors.purpleLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  unitChipText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.text },
  textBlock: { alignItems: "center", gap: 6, width: "100%" },
  title: { fontFamily: Fonts.bodyHeavy, fontSize: 30, color: Colors.text, textAlign: "center", lineHeight: 36 },
  body: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.muted, textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10, width: "100%" },
  statCard: { flex: 1, backgroundColor: Colors.purpleLight, borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
  statCardBlue: { flex: 1, backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
  statCardCream: { flex: 1, backgroundColor: "#FCE3C4", borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: Fonts.bodyHeavy, fontSize: 18, color: Colors.text },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 11, color: "#374151" },
  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
  },
  nextBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  nextBadgeText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  nextLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.muted },
  nextTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  actions: { width: "100%", gap: 12, alignItems: "center" },
  continueButton: { width: "100%", paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  continueButtonText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  reviewText: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.muted },
});
