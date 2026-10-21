import { StyleSheet, Text, View } from "react-native";

import { Colors, Fonts, Radii } from "@/constants/theme";

type Variant = "default" | "amber" | "grey" | "red";

interface ChipProps {
  label: string;
  variant?: Variant;
  style?: object;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  default: { bg: Colors.primaryLight, text: Colors.primaryDark },
  amber: { bg: Colors.chipAmberBg, text: Colors.chipAmberText },
  grey: { bg: Colors.chipGreyBg, text: Colors.chipGreyText },
  red: { bg: Colors.errorBg, text: Colors.errorText },
};

export function Chip({ label, variant = "default", style }: ChipProps) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.chip, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: Radii.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
  },
});
