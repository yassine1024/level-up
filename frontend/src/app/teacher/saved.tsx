import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useTeacherStore } from "@/src/store/teacher";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function LessonSavedScreen() {
  const insets = useSafeAreaInsets();
  const saved = useTeacherStore((s) => s.lastSaved);
  const resetDraft = useTeacherStore((s) => s.resetDraft);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/teacher/resources");
  };

  const path = [saved?.levelLabel, saved?.unitLabel, saved?.lessonLabel]
    .filter(Boolean)
    .join(" · ");

  if (!saved) {
    // Nothing was saved in this session: go straight back to the form.
    return <Redirect href="/teacher/resources" />;
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.badge}>
        <Ionicons name="checkmark" size={48} color={Colors.white} />
      </View>

      <Text style={styles.title}>Lesson saved</Text>
      <Text style={styles.subtitle}>
        {path}
        {"\n"}
        Your students can now open it in their Course tab.
      </Text>

      <View style={styles.card}>
        {saved.lines.length === 0 ? (
          <Text style={styles.line}>No resource attached yet.</Text>
        ) : (
          saved.lines.map((line) => (
            <View key={line.text} style={styles.row}>
              <Chip label="Done" />
              <Text style={styles.line}>{line.text}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.spacer} />

      <Button
        title="Add another lesson"
        onPress={() => {
          resetDraft();
          goBack();
        }}
      />
      <View style={{ height: 12 }} />
      <Button title="Back to resources" variant="ghost" onPress={goBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: Colors.background,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
    textAlign: "center",
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
    gap: 10,
  },
  line: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.text,
  },
  spacer: { height: 8 },
});
