import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

export default function CourseScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 44 }]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text style={styles.title}>Courses</Text>
            <View style={styles.langSelector}>
              <View style={styles.flag} />
              <Text style={styles.langText}>English</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.text} />
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.iconButton}>
              <Ionicons name="search-outline" size={20} color={Colors.text} />
            </View>
            <View style={styles.iconButton}>
              <Ionicons name="options-outline" size={20} color={Colors.text} />
            </View>
          </View>
        </View>

        {/* Current unit hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroText}>
            <View style={styles.tagRow}>
              <View style={styles.tagPurple}>
                <Text style={styles.tagPurpleText}>UNIT 03</Text>
              </View>
              <View style={styles.tagWhite}>
                <Text style={styles.tagGreyText}>A2 LEVEL</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Everyday Conversations</Text>
            <Text style={styles.heroBody}>Learn how to have real-life conversations in everyday situations.</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: "65%" }]} />
              </View>
              <Text style={styles.progressPercent}>65%</Text>
            </View>
            <Text style={styles.progressMeta}>4 / 6 lessons completed</Text>
            <Pressable style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue learning</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.white} />
            </Pressable>
          </View>
          <View style={styles.heroIllustration} />
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your learning path</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>View all units</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.purple} />
          </View>
        </View>

        {/* Path rows */}
        <View style={styles.pathList}>
          <View style={styles.pathRow}>
            <View style={styles.markerGreen}>
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            </View>
            <View style={styles.pathCardGreen}>
              <View style={styles.unitIcon}>
                <Ionicons name="book-outline" size={18} color={Colors.text} />
              </View>
              <View style={{ flex: 1, gap: 0 }}>
                <Text style={styles.unitTagGreen}>Unit 02</Text>
                <Text style={styles.pathTitle}>Everyday Vocabulary</Text>
                <Text style={styles.pathMeta}>Completed · 6 / 6 lessons</Text>
              </View>
              <View style={styles.reviewPill}>
                <Text style={styles.reviewPillText}>Review</Text>
                <Ionicons name="chevron-forward" size={12} color={Colors.text} />
              </View>
            </View>
          </View>

          <View style={styles.pathRow}>
            <View style={styles.markerPurple} />
            <View style={styles.pathCardPurple}>
              <View style={styles.unitIcon}>
                <Ionicons name="chatbubble-outline" size={18} color={Colors.text} />
              </View>
              <View style={{ flex: 1, gap: 0 }}>
                <Text style={styles.unitTagPurple}>Unit 03</Text>
                <Text style={styles.pathTitle}>Everyday Conversations</Text>
                <Text style={styles.pathMeta}>In progress · 4 / 6 lessons</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text} />
            </View>
          </View>

          <View style={styles.pathRow}>
            <View style={styles.markerGrey} />
            <View style={styles.pathCardGrey}>
              <View style={styles.unitIcon}>
                <Ionicons name="cafe-outline" size={18} color={Colors.text} />
              </View>
              <View style={{ flex: 1, gap: 0 }}>
                <Text style={styles.unitTagGrey}>Unit 04</Text>
                <Text style={styles.pathTitleGrey}>At the Restaurant</Text>
                <Text style={styles.pathMetaGrey}>Locked · Complete current unit to unlock</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text} />
            </View>
          </View>
        </View>

        {/* Course progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your course progress</Text>
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>View details</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.purple} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Ionicons name="flag-outline" size={16} color={Colors.text} />
              <Text style={styles.statNumber}>4 / 12</Text>
              <Text style={styles.statLabel}>Units completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Ionicons name="book-outline" size={16} color={Colors.text} />
              <Text style={styles.statNumber}>24 / 60</Text>
              <Text style={styles.statLabel}>Lessons completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColRing}>
              <View style={styles.ring}>
                <Text style={styles.ringText}>35%</Text>
              </View>
              <Text style={styles.statLabel}>Overall progress</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "35%" }]} />
          </View>
        </View>

        {/* Quick access */}
        <Text style={styles.quickTitle}>Quick access</Text>
        <View style={styles.quickRow}>
          <View style={styles.quickCardPurple}>
            <View style={styles.quickHeader}>
              <View style={styles.quickIcon}>
                <Ionicons name="layers-outline" size={18} color={Colors.text} />
              </View>
              <View style={{ flex: 1, height: 4 }} />
              <Ionicons name="chevron-forward" size={14} color={Colors.text} />
            </View>
            <Text style={styles.quickCardTitle}>All Units</Text>
            <Text style={styles.quickCardBody}>Explore your complete learning journey.</Text>
          </View>
          <View style={styles.quickCardGreen}>
            <View style={styles.quickHeader}>
              <View style={styles.quickIcon}>
                <Ionicons name="book-outline" size={18} color={Colors.text} />
              </View>
              <View style={{ flex: 1, height: 4 }} />
              <Ionicons name="chevron-forward" size={14} color={Colors.text} />
            </View>
            <Text style={styles.quickCardTitle}>My Vocabulary</Text>
            <Text style={styles.quickCardBody}>Review saved words and flashcards.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, gap: 12, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  titles: { gap: 2 },
  title: { fontFamily: Fonts.bodyHeavy, fontSize: 32, color: Colors.text },
  langSelector: { flexDirection: "row", alignItems: "center", gap: 6 },
  flag: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary },
  langText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.text },
  headerActions: { flexDirection: "row", gap: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  heroCard: {
    flexDirection: "row",
    gap: 6,
    padding: 14,
    borderRadius: 20,
    backgroundColor: Colors.purpleLight,
  },
  heroText: { flex: 1, gap: 4 },
  tagRow: { flexDirection: "row", gap: 6 },
  tagPurple: { backgroundColor: Colors.purple, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  tagPurpleText: { fontFamily: Fonts.bodyHeavy, fontSize: 10, color: Colors.white },
  tagWhite: { backgroundColor: Colors.white, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  tagGreyText: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.muted },
  heroTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text, lineHeight: 20 },
  heroBody: { fontFamily: Fonts.bodyBold, fontSize: 11, color: "#374151", lineHeight: 15 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.white, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.purple },
  progressPercent: { fontFamily: Fonts.bodyHeavy, fontSize: 11, color: Colors.text },
  progressMeta: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.muted },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  continueButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  heroIllustration: { width: 92, height: 120, borderRadius: 12, backgroundColor: Colors.primaryLight },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.purple },
  pathList: { gap: 8 },
  pathRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  markerGreen: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#80C9A2", alignItems: "center", justifyContent: "center" },
  markerPurple: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.purple, alignItems: "center", justifyContent: "center" },
  markerGrey: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  pathCardGreen: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#BDE0C8", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  pathCardPurple: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.purpleLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  pathCardGrey: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F5F6F8", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  unitIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  unitTagGreen: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#4FB460" },
  unitTagPurple: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.purple },
  unitTagGrey: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.muted },
  pathTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  pathTitleGrey: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: "#374151" },
  pathMeta: { fontFamily: Fonts.bodyBold, fontSize: 11, color: "#374151" },
  pathMetaGrey: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.muted },
  reviewPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.white, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  reviewPillText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.text },
  progressCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 12,
    gap: 8,
    backgroundColor: Colors.white,
  },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statCol: { flex: 1, gap: 0, paddingRight: 10 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: 4 },
  statColRing: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 10, flex: 1.2 },
  statNumber: { fontFamily: Fonts.bodyHeavy, fontSize: 18, color: Colors.text },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.muted },
  ring: { width: 46, height: 46, borderRadius: 23, borderWidth: 4, borderColor: Colors.purple, alignItems: "center", justifyContent: "center" },
  ringText: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.text },
  quickTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text },
  quickRow: { flexDirection: "row", gap: 12 },
  quickCardPurple: { flex: 1, backgroundColor: Colors.purpleLight, borderRadius: 20, padding: 12, gap: 6 },
  quickCardGreen: { flex: 1, backgroundColor: "#BDE0C8", borderRadius: 20, padding: 12, gap: 6 },
  quickHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  quickIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  quickCardTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  quickCardBody: { fontFamily: Fonts.bodyBold, fontSize: 11, color: "#374151", lineHeight: 14 },
});
