import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function CheckInboxScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✉️</Text>
        </View>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.subtitle}>
          We sent a link to your email. It works for 30 minutes.
        </Text>
        <Button title="Open email app" onPress={() => {}} />
        <Pressable style={styles.ghost} onPress={() => {}}>
          <Text style={styles.ghostText}>Resend link</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={() => router.back()}>
          <Text style={styles.ghostText}>Back to log in</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, gap: 16, alignItems: "center" },
  iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.board, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 44 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text, textAlign: "center" },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, textAlign: "center", lineHeight: 22 },
  ghost: { paddingVertical: 8 },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
