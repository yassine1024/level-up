import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "@/components/Button";
import { authApi } from "@/src/api/endpoints";
import { useAuthStore } from "@/src/store/auth";
import { mapApiError, friendlyMessage } from "@/src/api/errors";
import { Colors, Fonts, Radii } from "@/constants/theme";

type Role = "student" | "teacher";

export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ username?: string; password?: string }>();
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = params.username ?? "";
  const password = params.password ?? "";

  const handleContinue = async () => {
    if (!username || !password) {
      router.replace("/signup");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.register({
        username,
        password,
        role: role === "student" ? "STUDENT" : "TEACHER",
      });
      useAuthStore.getState().setToken(res.token);
      if (role === "student") router.replace("/placement");
      else router.replace("/teacher");
    } catch (e: any) {
      setError(friendlyMessage(mapApiError(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.body, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>I am a…</Text>
      <Text style={styles.subtitle}>You can not change this later in the MVP.</Text>

      <Pressable
        onPress={() => setRole("student")}
        style={[styles.card, role === "student" && styles.cardSelected]}>
        <View style={[styles.iconBox, { backgroundColor: Colors.primary }]}>
          <Ionicons name="school-outline" size={34} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Student</Text>
          <Text style={styles.cardDesc}>I want to learn English. Start with a short level test.</Text>
        </View>
        <View style={[styles.dot, role === "student" && styles.dotSelected]}>
          {role === "student" ? (
            <Ionicons name="checkmark" size={14} color={Colors.white} />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={() => setRole("teacher")}
        style={[styles.card, role === "teacher" && styles.cardSelected]}>
        <View style={[styles.iconBox, { backgroundColor: Colors.amber }]}>
          <Ionicons name="desktop-outline" size={34} color={Colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Teacher</Text>
          <Text style={styles.cardDesc}>I want to upload lessons for my students.</Text>
        </View>
        <View style={[styles.dot, role === "teacher" && styles.dotSelected]}>
          {role === "teacher" ? (
            <Ionicons name="checkmark" size={14} color={Colors.white} />
          ) : null}
        </View>
      </Pressable>

      <View style={{ flex: 1 }} />
      <Button
        title={loading ? "Creating account..." : "Continue"}
        disabled={loading}
        onPress={handleContinue}
      />
      {error ? (
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      ) : null}
      <View style={{ height: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.muted,
  },
  card: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    padding: 16,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
  },
  cardDesc: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});