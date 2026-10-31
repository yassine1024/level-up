import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts } from "@/constants/theme";
import { Button } from "@/components/Button";

export default function PlacementBeginnerScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.icon}>🌱</Text>
        <Text style={styles.title}>Total beginner?</Text>
        <Text style={styles.subtitle}>Skip the test and start at A1. You can retake it later.</Text>
        <Button title="Start at A1" onPress={() => router.replace("/course")} />
        <Pressable style={styles.ghost} onPress={() => router.replace("/placement")}>
          <Text style={styles.ghostText}>Take the test</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  icon: { fontSize: 48 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text, textAlign: "center" },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, textAlign: "center" },
  ghost: { paddingVertical: 8 },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
