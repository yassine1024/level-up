import { StyleSheet, Text, TextInput, View } from "react-native";

import { Colors, Fonts, Radii } from "@/constants/theme";

interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  minHeight?: number;
}

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  minHeight = 96,
}: TextAreaProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, { minHeight }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        accessibilityLabel={accessibilityLabel ?? label}
      />
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
  input: {
    width: "100%",
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
  },
});
