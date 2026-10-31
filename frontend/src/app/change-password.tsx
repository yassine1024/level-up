import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors, Fonts } from "@/constants/theme";

const MIN_PASSWORD_LENGTH = 6;

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!current.trim()) {
      setError("Enter your current password.");
      return;
    }
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`New password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 800);
  };

  return (
    <AuthLayout
      title="Change password"
      subtitle="Enter your current password and choose a new one.">
      <Input
        label="Current password"
        placeholder="Current password"
        value={current}
        onChangeText={(t) => { setCurrent(t); setError(null); }}
        secureTextEntry
      />
      <View style={{ marginTop: 12 }}>
        <Input
          label="New password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={next}
          onChangeText={(t) => { setNext(t); setError(null); }}
          secureTextEntry
        />
      </View>
      <View style={{ marginTop: 12 }}>
        <Input
          label="Confirm new password"
          placeholder="Repeat new password"
          value={confirm}
          onChangeText={(t) => { setConfirm(t); setError(null); }}
          secureTextEntry
        />
      </View>
      {error ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.errorText, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
            {error}
          </Text>
        </View>
      ) : null}
      <View style={{ marginTop: 16 }}>
        <Button
          title={loading ? "Saving..." : "Change password"}
          disabled={loading}
          onPress={handleSubmit}
        />
      </View>
      <View style={{ marginTop: 8 }}>
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({});
