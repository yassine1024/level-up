import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useKeyboardVisible } from "@/src/hooks/useKeyboardVisible";

import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
            onChangeText={setUsername}
          />
        </View>
        <Input
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          label="Confirm password"
          placeholder="Repeat your password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
        <View style={{ flex: 1, minHeight: 40 }} />
        <Button
          title="Sign up"
          onPress={() => {
            if (!username.trim() || !password.trim() || password !== confirm) {
              return;
            }
            router.push({
              pathname: "/role",
              params: { username, password },
            });
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