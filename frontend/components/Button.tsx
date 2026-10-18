import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Colors, Fonts, Radii } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "amber" | "ghost" | "disabled";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string; shadow: string | null; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.white, shadow: Colors.primaryDark, border: undefined },
  amber: { bg: Colors.amber, text: Colors.text, shadow: Colors.amberDark, border: undefined },
  ghost: { bg: "transparent", text: Colors.primary, shadow: null, border: Colors.primary },
  disabled: { bg: Colors.disabled, text: Colors.disabledText, shadow: null, border: undefined },
};

export function Button({ title, onPress, variant = "primary", disabled = false }: ButtonProps) {
  const v = disabled ? "disabled" : variant;
  const s = variantStyles[v];
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => {
        if (!disabled) {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        }
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        styles.base,
        { backgroundColor: s.bg },
        s.shadow ? { shadowColor: s.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 } : null,
        s.border ? { borderWidth: 2, borderColor: s.border } : null,
        animatedStyle,
      ]}>
      <Text style={[styles.text, { color: s.text }]}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    width: "100%",
    borderRadius: Radii.button,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
  },
});