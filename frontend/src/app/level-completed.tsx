import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts } from "@/constants/theme";
import { Button } from "@/components/Button";

export default function LevelCompletedScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.icon}>🏆</Text>
        <Text style={styles.title}>Level A1 complete!</Text>
        <Text style={styles.subtitle}>You finished all units. Retake the test or start A2.</Text>
        <Button title="Start A2" onPress={() => {}} />
        <Pressable style={styles.ghost} onPress={() => router.push("/placement?mode=retake")}>
          <Text style={styles.ghostText}>Retake placement test</Text>
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
