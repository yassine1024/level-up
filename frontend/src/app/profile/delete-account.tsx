import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

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
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <View style={styles.sheet} onStartShouldSetResponder={() => true}>
        <View style={styles.handle} />
        <Text style={styles.title}>Delete your account?</Text>
        <Text style={styles.message}>
          This permanently removes your profile, progress and XP. This can&apos;t be undone.
        </Text>
        <Text style={styles.label}>Type delete to confirm</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          placeholder="delete"
          placeholderTextColor={Colors.placeholder}
        />
        <Pressable
          style={[styles.deleteBtn, (!confirmed || loading) && styles.disabled]}
          disabled={!confirmed || loading}
          onPress={handleDelete}>
          <Text style={styles.deleteText}>
            {loading ? "Deleting..." : "Delete my account"}
          </Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
  },
  message: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.muted,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.errorBorder,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  deleteBtn: {
    height: 50,
    borderRadius: Radii.button,
    backgroundColor: Colors.errorText,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 15,
    color: Colors.white,
  },
  cancelBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
});
