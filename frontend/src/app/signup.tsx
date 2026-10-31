import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";

import { authApi } from "@/src/api/endpoints";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

const MIN_PASSWORD_LENGTH = 6;

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Choose a username. You will pick student or teacher next.
        </Text>
        <View style={{ marginTop: 8 }}>
          <Input
            label="Username"
            placeholder="choose a username"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(null); }}
            autoComplete="username"
            textContentType="username"
          />
        </View>
        <Input
          label="Password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={password}
          onChangeText={(t) => { setPassword(t); setError(null); }}
          secureTextEntry
          // Android keeps its "suggest strong password" chip, while iOS is
          // told this is a plain password field. Declaring `newPassword` on
          // iOS makes the system offer its own strong password, and React
          // Native then locks the field (yellow background, no more
          // keystrokes) - see facebook/react-native#53050. Do not switch the
          // iOS value to `newPassword` without patching React Native first.
          autoComplete="new-password"
          textContentType="password"
        />
        <Input
          label="Confirm password"
          placeholder="Repeat your password"
          value={confirm}
          onChangeText={(t) => { setConfirm(t); setError(null); }}
          secureTextEntry
          autoComplete="new-password"
          textContentType="password"
        />
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flex: 1, minHeight: 40 }} />
        <Button
          title={checking ? "Checking..." : "Sign up"}
          disabled={checking}
          onPress={async () => {
            if (!username.trim()) {
              setError("Choose a username to continue.");
              return;
            }
            if (password.length < MIN_PASSWORD_LENGTH) {
              setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
              return;
            }
            if (password !== confirm) {
              setError("Both passwords do not match.");
              return;
            }
            setError(null);
            setChecking(true);
            try {
              const { available } = await authApi.checkUsernameAvailability(
                username.trim()
              );
              if (!available) {
                setError("That username is already taken. Try another.");
                return;
              }
              router.push({
                pathname: "/role",
                params: { username, password },
              });
            } catch {
              setError("Could not check username. Check your connection and try again.");
            } finally {
              setChecking(false);
            }
          }}
        />
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.push("/login")}>
            Log in
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
