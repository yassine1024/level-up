import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Chip } from "@/components/Chip";
import { ErrorState } from "@/components/ErrorState";
import { useCourse } from "@/src/hooks/useCourse";
import { useGenerateSlides } from "@/src/hooks/useSlides";

export default function LoadingSlidesScreen() {
  const insets = useSafeAreaInsets();
  const courseQuery = useCourse();
  const { mutateAsync: generateSlides } = useGenerateSlides();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id;

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setStatus("loading");
      if (!lessonId) {
        if (courseQuery.isError && !cancelled) setStatus("error");
        return;
      }
      if (lessonId) {
        try {
          await generateSlides({ lessonId });
        } catch {
          if (!cancelled) setStatus("error");
          return;
        }
      }
      if (!cancelled) {
        router.replace("/lesson/slides");
      }
    };
    const timer = setTimeout(run, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [courseQuery.isError, generateSlides, lessonId, retryKey]);

  if (status === "error") {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
        <ErrorState
          title="Slide generation failed"
          description="We couldn't build your lesson slides. Check your connection and try again."
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <View style={styles.body}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.title}>Building your lesson…</Text>
        <Text style={styles.subtitle}>
          We are turning your teacher&apos;s files into slides.
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Chip label="Done" variant="default" />
            <Text style={styles.stepText}>Reading vocabulary and grammar</Text>
          </View>
          <View style={styles.row}>
            <Chip label="Now" variant="amber" />
            <Text style={styles.stepText}>Writing slides and examples</Text>
          </View>
          <View style={styles.row}>
            <Chip label="Next" variant="grey" />
            <Text style={styles.stepText}>Adding mini exercises</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text, textAlign: "center" },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, textAlign: "center" },
  card: { width: "100%", backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.cardBorder, borderRadius: Radii.card, padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text },
});
