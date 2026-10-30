import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 44 }]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.headerActions}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={20} color={Colors.text} />
            </View>
            <View style={[styles.iconCircle, { backgroundColor: Colors.purpleLight }]}>
              <Ionicons name="person-outline" size={20} color={Colors.text} />
            </View>
          </View>
        </View>

        {/* Greeting card */}
        <View style={styles.greetingCard}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.greetingSmall}>Hello, Asma!</Text>
            <Text style={styles.greetingBig}>Keep going!</Text>
            <Text style={styles.greetingBody}>Small steps every day lead to big progress.</Text>
          </View>
          <View style={styles.targetIllustration} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statValueRow}>
              <Ionicons name="flame" size={22} color={Colors.amber} />
              <Text style={styles.statValue}>5</Text>
            </View>
            <Text style={styles.statLabel}>Day streak</Text>
            <View style={styles.weekRow}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayDot,
                      i < 5 ? styles.dayDotFilled : styles.dayDotEmpty,
                    ]}
                  />
                  <Text style={styles.dayLabel}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statValueRow}>
              <Ionicons name="trophy-outline" size={22} color={Colors.primary} />
              <Text style={styles.statValue}>35 XP</Text>
            </View>
            <Text style={styles.statLabel}>Daily goal</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "70%" }]} />
            </View>
            <Text style={styles.goalValue}>35 / 50</Text>
          </View>
        </View>

        {/* Continue learning */}
        <View style={styles.purpleCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="book-outline" size={20} color={Colors.text} />
            <Text style={styles.cardHeaderTitle}>Continue learning</Text>
          </View>
          <View style={styles.lessonRow}>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>EN</Text>
            </View>
            <View style={{ flex: 1, gap: 0 }}>
              <Text style={styles.lessonTitle}>English</Text>
              <Text style={styles.lessonMeta}>Unit 2 · Lesson 3</Text>
              <Text style={styles.lessonMeta}>Vocabulary: Food & Drinks</Text>
            </View>
            <Pressable style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>

        {/* Today&apos;s challenge */}
        <View style={styles.pinkCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="game-controller-outline" size={20} color={Colors.text} />
            <Text style={styles.cardHeaderTitle}>Today&apos;s challenge</Text>
          </View>
          <Text style={styles.challengeTitle}>Play the word game</Text>
          <Text style={styles.challengeBody}>Match the words and earn 20 XP!</Text>
          <Pressable style={styles.playButton}>
            <Text style={styles.playButtonText}>Play now</Text>
          </Pressable>
        </View>

        {/* Quick cards */}
        <View style={styles.quickRow}>
          <View style={styles.quickCardBlue}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.text} />
              <Text style={styles.quickHeader}>Let&apos;s talk!</Text>
            </View>
            <Text style={styles.quickTitle}>Order a coffee</Text>
            <Text style={styles.quickBody}>Real-life conversation</Text>
            <Pressable style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
          </View>
          <View style={styles.quickCardCream}>
            <View style={styles.quickHeaderRow}>
              <Text style={styles.quickHeader}>Word of the day</Text>
              <Ionicons name="volume-medium-outline" size={18} color={Colors.text} />
            </View>
            <Text style={styles.wordTitle}>bright</Text>
            <Text style={styles.wordMeta}>/braɪt/</Text>
            <Text style={styles.wordMeta}>(adj.) full of light</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabItem}>
          <View style={styles.tabPillActive}>
            <Ionicons name="home-outline" size={22} color={Colors.text} />
          </View>
          <Text style={styles.tabLabelActive}>Home</Text>
        </View>
        <View style={styles.tabItem}>
          <View style={styles.tabPill}>
            <Ionicons name="book-outline" size={22} color={Colors.muted} />
          </View>
          <Text style={styles.tabLabel}>Courses</Text>
        </View>
        <View style={styles.tabItem}>
          <View style={styles.tabPill}>
            <Ionicons name="game-controller-outline" size={22} color={Colors.muted} />
          </View>
          <Text style={styles.tabLabel}>Practice</Text>
        </View>
        <View style={styles.tabItem}>
          <View style={styles.tabPill}>
            <Ionicons name="people-outline" size={22} color={Colors.muted} />
          </View>
          <Text style={styles.tabLabel}>Community</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, gap: 12, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  headerTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 32, color: Colors.text },
  headerActions: { flexDirection: "row", gap: 10 },
  iconCircle: { padding: 10, borderRadius: 20, backgroundColor: "#F5F6F8" },
  greetingCard: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  greetingSmall: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.text },
  greetingBig: { fontFamily: Fonts.bodyHeavy, fontSize: 24, color: Colors.text },
  greetingBody: { fontFamily: Fonts.bodyBold, fontSize: 12, color: "#374151", lineHeight: 17 },
  targetIllustration: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  statValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statValue: { fontFamily: Fonts.bodyHeavy, fontSize: 24, color: Colors.text },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted },
  weekRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  dayCol: { alignItems: "center", gap: 3 },
  dayDot: { width: 10, height: 10, borderRadius: 5 },
  dayDotFilled: { backgroundColor: Colors.primary },
  dayDotEmpty: { backgroundColor: Colors.border },
  dayLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.muted },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.purple },
  goalValue: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.muted, textAlign: "right" },
  purpleCard: {
    backgroundColor: Colors.purpleLight,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  langBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  langBadgeText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.white },
  lessonTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text },
  lessonMeta: { fontFamily: Fonts.bodyBold, fontSize: 12, color: "#374151" },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
  },
  continueButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  pinkCard: {
    backgroundColor: Colors.pinkLight,
    borderRadius: 20,
    padding: 14,
    gap: 4,
  },
  challengeTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  challengeBody: { fontFamily: Fonts.bodyBold, fontSize: 12, color: "#374151" },
  playButton: {
    backgroundColor: "#F362AA",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  playButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  quickRow: { flexDirection: "row", gap: 12 },
  quickCardBlue: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    padding: 14,
    gap: 4,
  },
  quickCardCream: {
    flex: 1,
    backgroundColor: "#FCE3C4",
    borderRadius: 20,
    padding: 14,
    gap: 3,
  },
  quickHeader: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text },
  quickHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quickTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.text },
  quickBody: { fontFamily: Fonts.bodyBold, fontSize: 11, color: "#374151" },
  startButton: {
    backgroundColor: Colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  startButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  wordTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 24, color: Colors.text },
  wordMeta: { fontFamily: Fonts.bodyBold, fontSize: 12, color: "#374151" },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 4 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16 },
  tabPillActive: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16, backgroundColor: Colors.primaryLight },
  tabLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.muted },
  tabLabelActive: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.text },
});
