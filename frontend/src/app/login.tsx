import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";
import { authApi } from "@/src/api/endpoints";
import { useAuthStore } from "@/src/store/auth";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={keyboardVisible}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Wordmark */}
        <View style={styles.wordmarkRow}>
          <View style={styles.mascot} />
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkLevel}>Level</Text>
            <Text style={styles.wordmarkUp}>Up</Text>
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to keep learning.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(false); }}
            keyboardType="email-address"
            autoComplete="username"
            textContentType="username"
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(false); }}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
          />
          <Text style={styles.forgot} onPress={() => router.push("/forgot-password")}>
            Forgot password?
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Error state: email or password is not correct. Try again.
            </Text>
          </View>
        ) : null}

        <View style={{ height: 88 }} />
        <Button
          title={loading ? "Signing in..." : "Log in"}
          disabled={loading}
          onPress={async () => {
            if (!username.trim() || !password.trim()) {
              setError(true);
              return;
            }
            setError(false);
            setLoading(true);
            try {
              const res = await authApi.login({ username, password });
              useAuthStore.getState().setToken(res.token);
              let role = "STUDENT";
              try {
                const payload = JSON.parse(
                  atob(res.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
                );
                if (payload?.role) role = String(payload.role);
              } catch {}
              if (role === "TEACHER") router.replace("/teacher");
              else router.replace("/home");
            } catch {
              setError(true);
            } finally {
              setLoading(false);
            }
          }}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to LevelUp?</Text>
          <Text style={styles.footerLink} onPress={() => router.push("/signup")}>
            Create an account
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.background,
    gap: 0,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 41,
  },
  mascot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
  },
  wordmark: {
    fontFamily: Fonts.semiBold,
    fontSize: 36,
    letterSpacing: -0.224,
  },
  wordmarkLevel: { color: Colors.text },
  wordmarkUp: { color: Colors.primary },
  titleBlock: {
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 28,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.muted,
  },
  form: {
    gap: 18,
  },
  forgot: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.text,
    textAlign: "right",
    textDecorationLine: "underline",
  },
  errorCard: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.errorBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.errorText,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 221,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.muted,
  },
  footerLink: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 15,
    color: Colors.text,
    textDecorationLine: "underline",
  },
});
