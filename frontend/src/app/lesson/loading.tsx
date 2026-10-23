import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Chip } from "@/components/Chip";

export default function LoadingSlidesScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/lesson/slides");
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

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
        <View style={{ height: 80 }} />
      </View>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 18,
    textAlign: "center",
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
});
