import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts } from "@/constants/theme";
import { Button } from "@/components/Button";

export default function ChatErrorScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.title}>Yasmine is slow today…</Text>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Message not sent</Text>
        </View>
        <Button title="Send again" onPress={() => router.back()} />
        <Pressable style={styles.ghost} onPress={() => router.back()}>
          <Text style={styles.ghostText}>Leave chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text, textAlign: "center" },
  errorBox: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.errorBg },
  errorText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.errorText },
  ghost: { paddingVertical: 8 },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
