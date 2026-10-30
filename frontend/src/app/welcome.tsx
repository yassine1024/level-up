import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Button } from "@/components/Button";
import { Colors, Fonts } from "@/constants/theme";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      {/* Green hero */}
      <View style={styles.hero}>
        <View style={styles.bubbleLeft}>
          <Text style={styles.bubbleLeftText}>Hello!</Text>
        </View>
        <View style={styles.bubbleRight}>
          <Text style={styles.bubbleRightText}>Salam!</Text>
        </View>
      </View>

      {/* Body */}
      <View style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Lisan · working name</Text>
        </View>
        <Text style={styles.title}>Learn English the fun way.</Text>
        <Text style={styles.subtitle}>
          Lessons from your teacher, games to practice, and a character who chats
          with you and fixes your mistakes.
        </Text>
        <View style={{ flex: 1 }} />
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Button title="Create account" onPress={() => router.push("/signup")} />
        </Animated.View>
        <View style={{ height: 12 }} />
        <Animated.View entering={FadeInUp.delay(220).springify()}>
          <Button
            title="I already have an account"
            variant="ghost"
            onPress={() => router.push("/login")}
          />
        </Animated.View>
        <View style={{ height: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: {
    height: 400,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bubbleLeft: {
    position: "absolute",
    top: 60,
    left: 30,
    width: 176,
    height: 92,
    borderRadius: 30,
    backgroundColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleLeftText: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: Colors.text,
  },
  bubbleRight: {
    position: "absolute",
    top: 170,
    right: 30,
    width: 176,
    height: 92,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleRightText: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: Colors.primaryDark,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  chip: {
    alignSelf: "flex-start",
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.text,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
});