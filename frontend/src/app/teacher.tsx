import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts } from "@/constants/theme";

export default function TeacherScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.body, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Teacher</Text>
      <Text style={styles.subtitle}>Coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  title: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, marginTop: 8 },
});