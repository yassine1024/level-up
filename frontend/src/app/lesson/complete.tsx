import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Chip } from "@/components/Chip";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { useCourse } from "@/src/hooks/useCourse";
import { useCompleteLesson } from "@/src/hooks/useProgress";

export default function UnitCompleteScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const completeLesson = useCompleteLesson();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id;

  useEffect(() => {
    if (lessonId) {
      completeLesson.mutate(lessonId);
    }
  }, [lessonId, completeLesson]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.body}>
        <View style={{ height: 16 }} />
        <View style={styles.trophyCircle}>
          <Ionicons name="trophy" size={72} color={Colors.amberDark} />
        </View>
        <Chip label="Unit 1 · Meeting people" variant="amber" />
        <Text style={styles.title}>Unit complete!</Text>
        <Text style={styles.subtitle}>
          You finished all 3 lessons. Unit 2 is now open.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3 / 3</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Unit 2</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/course")}>
          <Text style={styles.primaryButtonText}>Go to Unit 2</Text>
        </Pressable>
        <Pressable
          style={styles.ghostButton}
          onPress={() => router.back()}>
          <Text style={styles.ghostButtonText}>Practice this unit</Text>
        </Pressable>
        <View style={{ height: 16 }} />
      </View>
      <StudentBottomNav
        active="course"
        onCoursePress={() => router.replace("/course")}
        onPracticePress={() => router.navigate("/practice")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 24,
    gap: 14,
    backgroundColor: Colors.background,
  },
  trophyCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.chipAmberBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
    textAlign: "center",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 2,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.white,
  },
  ghostButton: {
    width: "100%",
    height: 54,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.primaryDark,
  },
});
