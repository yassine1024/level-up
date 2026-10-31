import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";

export default function LegalHubScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms and Privacy</Text>
        <Text style={styles.subtitle}>
          Scrollable text: data we store, files, AI processing, deletion rights, contact.
        </Text>
        <Button title="Terms of Service" onPress={() => router.push("/legal/terms")} />
        <Button title="Privacy Policy" onPress={() => router.push("/legal/privacy")} />
        <Pressable style={styles.ghost} onPress={() => router.back()}>
          <Text style={styles.ghostText}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 16 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, lineHeight: 20 },
  ghost: { paddingVertical: 8, alignItems: "center" },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
