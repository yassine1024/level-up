/* eslint-disable react-hooks/refs */
import {
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useCourse } from "@/src/hooks/useCourse";
import { Colors, Fonts, Radii } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "@/components/Chip";
import { StudentBottomNav } from "@/components/StudentBottomNav";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CourseScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const course = courseQuery.data;

  const [showOptions, setShowOptions] = useState(false);

  const SCREEN_HEIGHT = Dimensions.get("window").height;

  const playScale = useSharedValue(1);
  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const sheetY = useSharedValue(SCREEN_HEIGHT);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const progress = 1 - sheetY.value / SCREEN_HEIGHT;
    const clamped = Math.max(0, Math.min(1, progress));
    return { opacity: 0.35 * clamped };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
      // eslint-disable-next-line react-hooks/immutability
        sheetY.value = Math.max(0, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.25) {
      // eslint-disable-next-line react-hooks/immutability
          sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
            if (finished) {
              runOnJS(setShowOptions)(false);
            }
          });
        } else {
          sheetY.value = withSpring(0, { damping: 20, stiffness: 220 });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (showOptions) {
      // eslint-disable-next-line react-hooks/immutability
      sheetY.value = SCREEN_HEIGHT;
      sheetY.value = withTiming(0, { duration: 300 });
    }
  }, [showOptions, sheetY, SCREEN_HEIGHT]);

  const closeSheet = () => {
      // eslint-disable-next-line react-hooks/immutability
    sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(setShowOptions)(false);
      }
    });
  };

  const levelLabel = course
    ? `Level ${course.levelId}`
    : "Level A1";
  const currentUnit = course?.currentUnit;
  const unitTitle = currentUnit?.title ?? "Meeting people";
  const unitNumber = currentUnit?.number ?? 1;
  const completed = currentUnit?.completedLessons ?? 1;
  const total = currentUnit?.totalLessons ?? 3;
  const progress = currentUnit?.progress ?? 1 / 3;
  const currentLesson = currentUnit?.currentLesson;
  const lessonLabel = currentLesson
    ? `Lesson ${currentLesson.number} · ${currentLesson.title}`
    : "Lesson 2 · Introducing yourself";
  const previousUnits = course?.previousUnits ?? [];
  const nextUnits = course?.nextUnits ?? [
    { number: 2, title: "Daily routines" },
    { number: 3, title: "Food and drinks" },
  ];

  const handlePlay = () => setShowOptions(true);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Course</Text>
          <Chip label={levelLabel} variant="amber" />
        </View>

        {/* Previous units */}
        <View>
          <Text style={styles.sectionTitle}>Previous units</Text>
          {previousUnits.length === 0 ? (
            <View style={styles.dashedCard}>
              <Text style={styles.small}>Finished units will appear here.</Text>
            </View>
          ) : (
            previousUnits.map((u) => (
              <View key={u.number} style={styles.unitCard}>
                <Text style={styles.unitTitle}>{u.title}</Text>
              </View>
            ))
          )}
        </View>

        {/* Current unit */}
        <View>
          <Text style={styles.sectionTitle}>Current unit</Text>
          <View style={styles.currentUnit}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.unitEyebrow}>UNIT {unitNumber}</Text>
                <Text style={styles.unitHeading}>{unitTitle}</Text>
              </View>
              <Chip label={`${completed} of ${total} lessons`} variant="amber" />
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
            <View style={styles.lessonCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonEyebrow}>Current lesson</Text>
                <Text style={styles.lessonTitle}>{lessonLabel}</Text>
              </View>
              <AnimatedPressable
                onPress={handlePlay}
                onPressIn={() => {
      // eslint-disable-next-line react-hooks/immutability
                  playScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
                }}
                onPressOut={() => {
      // eslint-disable-next-line react-hooks/immutability
                  playScale.value = withSpring(1, { damping: 15, stiffness: 300 });
                }}
                style={[styles.playButton, playAnimatedStyle]}
                accessibilityRole="button"
                accessibilityLabel="Open lesson">
                <Ionicons name="play" size={18} color={Colors.text} style={{ marginLeft: 2 }} />
              </AnimatedPressable>
            </View>
          </View>
        </View>

        {/* Next units */}
        <View>
          <Text style={styles.sectionTitle}>Next units</Text>
          <View style={{ gap: 10 }}>
            {nextUnits.map((u) => (
              <View key={u.number} style={styles.lockedCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockedEyebrow}>UNIT {u.number}</Text>
                  <Text style={styles.lockedTitle}>{u.title}</Text>
                </View>
                <Ionicons name="lock-closed" size={18} color={Colors.muted} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <StudentBottomNav
        active="course"
        onCoursePress={() => {}}
        onPracticePress={() => router.navigate("/practice")}
        onHomePress={() => router.navigate("/home")}
      />

      {showOptions ? (
        <View style={styles.sheetOverlay}>
          <AnimatedPressable
            style={[styles.sheetBackdrop, backdropAnimatedStyle]}
            onPress={closeSheet}
          />
          <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
            <View
              style={styles.sheetHandle}
              hitSlop={{ top: 16, bottom: 16, left: 60, right: 60 }}
              {...panResponder.panHandlers}
            />
            <Text style={styles.sheetEyebrow}>
              UNIT {unitNumber} · LESSON {currentLesson?.number ?? 2}
            </Text>
            <Text style={styles.sheetTitle}>
              {currentLesson?.title ?? "Introducing yourself"}
            </Text>
            <Text style={styles.sheetBody}>
              Slides built from your teacher&apos;s vocabulary and grammar. You
              stopped at slide 4 of 9.
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
      // eslint-disable-next-line react-hooks/immutability
                sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
                  if (finished) {
                    runOnJS(setShowOptions)(false);
                    runOnJS(router.push)("/lesson/slides");
                  }
                });
              }}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => {
      // eslint-disable-next-line react-hooks/immutability
                sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
                  if (finished) {
                    runOnJS(setShowOptions)(false);
                    runOnJS(router.push)("/lesson/slides?start=0");
                  }
                });
              }}>
              <Text style={styles.ghostButtonText}>
                Start course from the beginning
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: {
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.text,
  },
  sectionTitle: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
  },
  dashedCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
  },
  unitCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
  },
  unitTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.text,
  },
  currentUnit: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  unitEyebrow: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    letterSpacing: 0.6,
    color: Colors.primaryLight,
  },
  unitHeading: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.white,
    marginTop: 2,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryDark,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.amber,
    borderRadius: 6,
  },
  lessonCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonEyebrow: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  lessonTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.text,
    marginTop: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    color: Colors.text,
    fontSize: 14,
    marginLeft: 2,
  },
  lockedCard: {
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lockedEyebrow: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.muted,
  },
  lockedTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.muted,
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 16,
    color: Colors.muted,
  },
  sheetOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(16,36,28,0.35)",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
    shadowColor: "rgba(16,36,28,0.25)",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  sheetHandle: {
    width: 64,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetEyebrow: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.primaryDark,
    letterSpacing: 0.6,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.text,
  },
  sheetBody: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
  primaryButton: {
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
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.primaryDark,
  },
});
