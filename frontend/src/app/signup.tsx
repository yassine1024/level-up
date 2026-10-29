import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";
import { authApi } from "@/src/api/endpoints";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleSignUp = async () => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      setError("Choose an email to continue.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setError(null);
    setCheckingUsername(true);
    try {
      const { available } = await authApi.checkUsernameAvailability(
        normalizedUsername
      );
      if (!available) {
        setError("That email is already taken. Choose another one.");
        return;
      }
      router.push({
        pathname: "/role",
        params: { username: normalizedUsername, password },
      });
    } catch {
      setError(
        "We couldn't check that email. Check your connection and try again."
      );
    } finally {
      setCheckingUsername(false);
    }
  };

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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start your English journey today.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(null); }}
            keyboardType="email-address"
            autoComplete="username"
            textContentType="username"
          />
          <Input
            label="Password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            secureTextEntry
            autoComplete="new-password"
            textContentType="password"
          />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1, minHeight: 40 }} />
        <Button
          title={checkingUsername ? "Checking..." : "Create account"}
          disabled={checkingUsername}
          onPress={handleSignUp}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text style={styles.footerLink} onPress={() => router.push("/login")}>
            Log in
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
    marginBottom: 24,
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
    marginTop: 24,
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
