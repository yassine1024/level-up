import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "@/components/Button";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Illustration */}
      <View style={styles.illustration} />

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          <Text style={styles.titleLevel}>Level</Text>
          <Text style={styles.titleUp}>Up</Text>
        </Text>
        <Text style={styles.subtitle}>Your journey starts here</Text>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 24 }]}>
        <Button title="Start learning" onPress={() => router.push("/signup")} />
        <View style={{ height: 34 }} />
        <View style={styles.secondaryButton}>
          <Text
            style={styles.secondaryText}
            onPress={() => router.push("/login")}>
            I have already an account
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 27,
  },
  illustration: {
    position: "absolute",
    left: 229,
    top: 168,
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: Colors.primaryLight,
  },
  titleBlock: {
    position: "absolute",
    left: 56,
    top: 270,
    width: 269,
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 70,
    letterSpacing: -0.98,
    textAlign: "center",
  },
  titleLevel: {
    color: Colors.text,
  },
  titleUp: {
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: -0.224,
  },
  actions: {
    position: "absolute",
    left: 27,
    top: 414,
    width: 327,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.primary,
  },
});
