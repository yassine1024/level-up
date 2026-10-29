import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "@/components/Button";
import { authApi } from "@/src/api/endpoints";
import { useAuthStore } from "@/src/store/auth";
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
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Sign up failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Wordmark */}
        <View style={styles.wordmarkRow}>
          <View style={styles.mascot} />
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkLevel}>Level</Text>
            <Text style={styles.wordmarkUp}>Up</Text>
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>How will you use LevelUp?</Text>
          <Text style={styles.subtitle}>Choose your role. You can change it later.</Text>
        </View>

        <Pressable
          onPress={() => setRole("student")}
          style={[styles.card, role === "student" && styles.cardSelected]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
            <Text style={styles.iconText}>S</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Student</Text>
            <Text style={styles.cardDesc}>I want to learn and practice English</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setRole("teacher")}
          style={[styles.card, role === "teacher" && styles.cardSelectedTeacher]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.purpleLight }]}>
            <Text style={styles.iconText}>T</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Teacher</Text>
            <Text style={styles.cardDesc}>I upload the course resources</Text>
          </View>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.action, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          title={loading ? "Creating account..." : "Continue"}
          disabled={loading}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, gap: 16, paddingBottom: 24 },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  mascot: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryLight },
  wordmark: { fontFamily: Fonts.semiBold, fontSize: 36, letterSpacing: -0.224 },
  wordmarkLevel: { color: Colors.text },
  wordmarkUp: { color: Colors.primary },
  titleBlock: { gap: 8, marginBottom: 8 },
  title: { fontFamily: Fonts.bodyHeavy, fontSize: 28, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted },
  card: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardSelectedTeacher: {
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontFamily: Fonts.bodyHeavy, fontSize: 20, color: Colors.text },
  cardTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 18, color: Colors.text },
  cardDesc: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, marginTop: 4 },
  error: { color: Colors.errorText, textAlign: "center" },
  action: { paddingHorizontal: 24 },
});
