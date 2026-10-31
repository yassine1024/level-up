import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";
import { useMe } from "@/src/hooks/useMe";
import { useCourse } from "@/src/hooks/useCourse";

const MOCK_HOME = {
  username: "demo",
  levelId: "A1",
  unitTitle: "Meeting people",
  completedLessons: 1,
  totalLessons: 3,
  progress: 1 / 3,
  lessonNumber: 2,
  lessonTitle: "Introducing yourself",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const meQuery = useMe();
  const courseQuery = useCourse();

  const mockFallback = meQuery.isError || courseQuery.isError;
  const levelLabel = courseQuery.data
    ? `Level ${courseQuery.data.levelId}`
    : `Level ${MOCK_HOME.levelId}`;
  const greeting = `Hello, ${meQuery.data?.username ?? MOCK_HOME.username}! Ready to learn?`;
  const currentUnit = courseQuery.data?.currentUnit;
  const currentLesson = currentUnit?.currentLesson;
  const unitTitle = currentUnit?.title ?? MOCK_HOME.unitTitle;
  const completedLessons = currentUnit?.completedLessons ?? MOCK_HOME.completedLessons;
  const totalLessons = currentUnit?.totalLessons ?? MOCK_HOME.totalLessons;
  const lessonNumber = currentLesson?.number ?? MOCK_HOME.lessonNumber;
  const lessonTitle = currentLesson?.title ?? MOCK_HOME.lessonTitle;
  const progressPercent = Math.round(
    (currentUnit?.progress ?? MOCK_HOME.progress) * 100
  );
  const isLoading = meQuery.isLoading || courseQuery.isLoading;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.body}>
        <View style={{ height: 8 }} />
        <Chip label={levelLabel} variant="amber" style={{ alignSelf: "flex-start" }} />
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>
          Keep going with your English practice.
        </Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.primaryDark} />
            <Text style={styles.mutedText}>Loading your learning plan...</Text>
          </View>
        ) : (currentUnit && currentLesson) || mockFallback ? (
          <>
            <View style={styles.progressCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.eyebrow}>YOUR CURRENT UNIT</Text>
                  <Text style={styles.cardTitle}>{unitTitle}</Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressValue}>{progressPercent}%</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressLabel}>
                {completedLessons} of {totalLessons} lessons complete
              </Text>
            </View>

            <Pressable style={styles.lessonCard} onPress={() => router.push("/lesson/loading")}>
              <View style={styles.lessonIcon}>
                <Ionicons name="play" size={20} color={Colors.primaryDark} />
              </View>
              <View style={styles.lessonCopy}>
                <Text style={styles.eyebrow}>UP NEXT</Text>
                <Text style={styles.lessonTitle}>
                  Lesson {lessonNumber}: {lessonTitle}
                </Text>
                <Text style={styles.lessonSub}>Continue your lesson</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
            </Pressable>
          </>
        ) : (
          <View style={styles.loadingCard}>
            <Text style={styles.mutedText}>Your learning plan is not available yet.</Text>
          </View>
        )}
      </View>
      <StudentBottomNav
        active="home"
        onCoursePress={() => router.navigate("/course")}
        onPracticePress={() => router.navigate("/practice")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
  loadingCard: {
    minHeight: 120,
    borderRadius: Radii.card,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  mutedText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radii.card,
    padding: 18,
    gap: 14,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { fontFamily: Fonts.bodyHeavy, fontSize: 11, letterSpacing: 0.6, color: Colors.primaryLight },
  cardTitle: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.white, marginTop: 4 },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: Colors.skyLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.white },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: "#60A5FA", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: Colors.white },
  progressLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.primaryLight },
  lessonCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonCopy: { flex: 1 },
  lessonTitle: { fontFamily: Fonts.heading, fontSize: 17, color: Colors.text, marginTop: 4 },
  lessonSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: 4 },
});
