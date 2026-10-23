import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";

interface InputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  /**
   * HTML autofill token. Used by Android, ignored on iOS when
   * `textContentType` is provided.
   */
  autoComplete?: TextInputProps["autoComplete"];
  /**
   * iOS only. Declaring it explicitly stops iOS from guessing the role of the
   * field, which is what makes it offer its "strong password" autofill.
   */
  textContentType?: TextInputProps["textContentType"];
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
  /**
   * Bumping this key remounts the native text input.
   *
   * iOS can leave a password field in a broken state after its own autofill
   * ("Use Strong Password"): the field keeps the yellow autofill background,
   * stops accepting keystrokes and the text can no longer be edited or
   * cleared. React Native cannot recover from it, the only reliable fix is to
   * throw the native view away and mount a fresh one
   * (see facebook/react-native#53050). Toggling the eye therefore also
   * remounts the input, which gives the user a way out of a stuck field.
   */
  const [nativeKey, setNativeKey] = useState(0);

  const toggleVisibility = () => {
    setHidden((h) => !h);
    setNativeKey((k) => k + 1);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          key={nativeKey}
          style={[styles.input, secureTextEntry && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={toggleVisibility}
            style={styles.eyeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            accessibilityHint="Shows or hides the password and resets the field if it is stuck">
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
