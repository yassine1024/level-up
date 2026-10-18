import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";

import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

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
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(false); }}
            keyboardType="email-address"
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
          title="Log in"
          onPress={() => {
            if (!email.trim() || !password.trim()) {
              setError(true);
              return;
            }
            setError(false);
            router.push("/role");
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