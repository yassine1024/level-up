import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";
import { authApi } from "@/src/api/endpoints";
import { useAuthStore } from "@/src/store/auth";

import { BackButton } from "@/components/BackButton";
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
        <View style={styles.row}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to pick up where you stopped.</Text>
        <View style={{ marginTop: 8 }}>
          <Input
            label="Username"
            placeholder="your username"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(false); }}
          />
        </View>
        <Input
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(false); }}
          secureTextEntry
        />
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Error state: email or password is not correct. Try again.
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1, minHeight: 40 }} />
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
              // Route based on the role embedded in the JWT so the role
              // selection screen only appears during account creation.
              let role = "STUDENT";
              try {
                const payload = JSON.parse(
                  atob(res.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
                );
                if (payload?.role) role = String(payload.role);
              } catch {
                // Fall back to student home if the token cannot be decoded.
              }
              if (role === "TEACHER") router.replace("/teacher");
              else router.replace("/home");
            } catch {
              setError(true);
            } finally {
              setLoading(false);
            }
          }}
        />
        <Text style={styles.footer}>
          New here?{" "}
          <Text style={styles.link} onPress={() => router.push("/signup")}>
            Create an account
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  row: { height: 44 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
  errorCard: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.errorBorder,
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.errorText,
  },
  footer: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
    paddingBottom: 28,
  },
  link: {
    color: Colors.primaryDark,
    fontFamily: Fonts.bodyHeavy,
  },
});