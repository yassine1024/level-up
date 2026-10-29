import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";

import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts } from "@/constants/theme";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const me = useMe({ enabled: !!token });

  useEffect(() => {
    if (!token) {
      router.replace("/welcome");
      return;
    }
    if (me.isSuccess) {
      const role = (me.data as any)?.role;
      if (role === "TEACHER") router.replace("/teacher");
      else router.replace("/home");
    }
    if (me.isError) {
      useAuthStore.getState().logout();
      router.replace("/welcome");
    }
  }, [token, me.isSuccess, me.isError, me.data]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkLevel}>Level</Text>
        <Text style={styles.wordmarkUp}>Up</Text>
      </Text>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
      <Text style={styles.checking}>Checking your session…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  wordmark: {
    fontFamily: Fonts.semiBold,
    fontSize: 48,
    letterSpacing: -0.224,
  },
  wordmarkLevel: { color: Colors.text },
  wordmarkUp: { color: Colors.primary },
  checking: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, marginTop: 8 },
});
