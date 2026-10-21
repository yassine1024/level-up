import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

interface InputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoComplete?: "off" | "password" | "password-new" | "username" | "email";
  textContentType?: "none" | "password" | "newPassword" | "username" | "emailAddress";
  id?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoComplete,
  textContentType,
}: InputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, secureTextEntry && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoComplete={autoComplete}
          textContentType={textContentType}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.eyeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  label: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    position: "relative",
    width: "100%",
  },
  input: {
    height: 52,
    width: "100%",
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
