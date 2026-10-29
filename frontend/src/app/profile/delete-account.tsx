import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";

const CONFIRM_WORD = "DELETE";

export default function DeleteAccountScreen() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = value.trim().toUpperCase() === CONFIRM_WORD;

  const handleDelete = () => {
    if (!confirmed) return;
    setLoading(true);
    setTimeout(() => {
      useAuthStore.getState().logout();
      setLoading(false);
      router.replace("/welcome");
    }, 800);
  };

  return (
    <AuthLayout
      title="Delete account"
      subtitle={`This is permanent. Type "${CONFIRM_WORD}" to confirm.`}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        autoCapitalize="characters"
        placeholder={CONFIRM_WORD}
        placeholderTextColor={Colors.placeholder}
      />
      <Button
        title={loading ? "Deleting..." : "Delete my account"}
        variant="primary"
        disabled={!confirmed || loading}
        onPress={handleDelete}
      />
      <View style={{ marginTop: 8 }}>
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    width: "100%",
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.errorBorder,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 4,
  },
});
