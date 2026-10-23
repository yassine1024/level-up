import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";

import { Chip } from "@/components/Chip";
import { Colors, Fonts, Radii } from "@/constants/theme";
import type { PickedDocument } from "@/src/types/api";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface UploadFieldProps {
  label: string;
  /** Grey chip describing the accepted files, e.g. "PDF · DOCX · TXT". */
  hint?: string;
  /** MIME types offered by the system picker. */
  accept: string[];
  /** Allowed file extensions, validated after the pick. */
  extensions: string[];
  value?: PickedDocument | null;
  onChange: (doc: PickedDocument | null) => void;
  disabled?: boolean;
  /** Marks the slot as not available yet. */
  comingSoon?: boolean;
}

export function UploadField({
  label,
  hint,
  accept,
  extensions,
  value,
  onChange,
  disabled = false,
  comingSoon = false,
}: UploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const isDisabled = disabled || comingSoon;

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePress = async () => {
    if (isDisabled) return;
    setError(null);

    const result = await DocumentPicker.getDocumentAsync({
      type: accept,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;

    const extension = asset.name.split(".").pop()?.toLowerCase() ?? "";
    if (!extensions.includes(extension)) {
      setError(`Only ${extensions.join(", ")} files are accepted.`);
      return;
    }

    onChange({
      uri: asset.uri,
      fileName: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
      file: asset.file,
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {comingSoon ? <Chip label="Coming soon" variant="grey" /> : null}
      </View>

      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          if (isDisabled) return;
          scale.set(
            withSpring(reduced ? 1 : 0.97, { duration: 100, dampingRatio: 1 })
          );
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { duration: 100, dampingRatio: 1 }));
        }}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `Replace ${label} file` : `Choose a ${label} file`
        }
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.box,
          value ? styles.boxFilled : styles.boxEmpty,
          isDisabled && styles.boxDisabled,
          boxStyle,
        ]}>
        <Ionicons
          name={value ? "checkmark" : "cloud-upload-outline"}
          size={20}
          color={value ? Colors.primaryDark : Colors.chipGreyText}
        />
        <Text
          style={[styles.boxText, value && styles.boxTextFilled]}
          numberOfLines={1}>
          {value ? value.fileName : "Choose a file"}
        </Text>
        {value ? (
          <Chip label="Replace" />
        ) : hint ? (
          <Chip label={hint} variant="grey" />
        ) : null}
      </AnimatedPressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.text,
  },
  box: {
    height: 52,
    width: "100%",
    borderRadius: Radii.input,
    borderWidth: 2,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  boxEmpty: {
    borderStyle: "dashed",
    borderColor: Colors.dashedBorder,
  },
  boxFilled: {
    borderStyle: "solid",
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  boxDisabled: { opacity: 0.55 },
  boxText: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.chipGreyText,
  },
  boxTextFilled: { color: Colors.primaryDark },
  error: {
    marginTop: 6,
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.errorText,
  },
});
