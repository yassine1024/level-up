import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts } from "@/constants/theme";

export default function SplashScreen() {
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
    <View style={styles.root}>
      <Text style={styles.logo}>Level-Up</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontFamily: Fonts.heading,
    fontSize: 40,
    color: Colors.white,
  },
});
