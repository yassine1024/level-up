import { StyleSheet, Text, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.errorBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.errorText,
  },
});
