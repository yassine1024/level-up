import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";
import { useMe } from "@/src/hooks/useMe";
import { useCourse } from "@/src/hooks/useCourse";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const meQuery = useMe();
  const courseQuery = useCourse();

  const levelLabel = courseQuery.data
    ? `Level ${courseQuery.data.levelId}`
    : "Level A1";
  const greeting = meQuery.data?.username
    ? `Hello, ${meQuery.data.username}! Ready to learn?`
    : "Hello! Ready to learn?";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.body}>
        <View style={{ height: 8 }} />
        <Chip label={levelLabel} variant="amber" style={{ alignSelf: "flex-start" }} />
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>
          Open the Course tab to continue your lesson, or the Practice tab to play.
        </Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Home content comes in a later version.</Text>
        </View>
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
  emptyCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.dashedBorder,
    borderRadius: Radii.card,
    backgroundColor: "transparent",
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
  },
});
