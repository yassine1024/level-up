import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Colors, Fonts } from "@/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IconName;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
  icon = "alert-circle-outline",
  compact = false,
}: ErrorStateProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={40} color={Colors.errorText} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <View style={styles.action}>
          <Button title={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
    flex: 1,
  },
  wrapCompact: {
    flex: 0,
    paddingVertical: 16,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.muted,
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    width: "100%",
    marginTop: 12,
  },
});
