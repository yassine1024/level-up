import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" showBack={false}>
        <View style={styles.center}>
          <Text style={styles.text}>Your password has been reset. You can now log in.</Text>
          <View style={{ width: "100%", marginTop: 16 }}>
            <Button title="Go to login" onPress={() => router.replace("/login")} />
          </View>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle={params.token ? "Choose a new password." : "Missing reset token."}>
      <Input
        label="New password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        secureTextEntry
      />
      <Input
        label="Confirm password"
        placeholder="Repeat your password"
        value={confirm}
        onChangeText={(t) => { setConfirm(t); setError(null); }}
        secureTextEntry
      />
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <Button
        title={loading ? "Updating..." : "Update password"}
        disabled={loading || !params.token}
        onPress={handleSubmit}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12 },
  text: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
    textAlign: "center",
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
});
