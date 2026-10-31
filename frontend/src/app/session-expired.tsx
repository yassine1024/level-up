import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/Button";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function SessionExpiredScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Session expired</Text>
        <Text style={styles.subtitle}>
          For your security, please log in again to continue.
        </Text>
        <View style={{ width: "100%", marginTop: 16 }}>
          <Button title="Log in" onPress={() => router.replace("/login")} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: 24,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
});
