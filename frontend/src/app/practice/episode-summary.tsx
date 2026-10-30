import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function EpisodeSummaryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dinner talk · done</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>3 small fixes</Text>
          <Text style={styles.cardSub}>eat→ate · cook→cooked</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>New words</Text>
          <Text style={styles.rowValue}>spicy, homemade, rice</Text>
        </View>
        <Button title="Save mistakes" onPress={() => {}} />
        <Pressable style={styles.ghost} onPress={() => router.push("/practice/character")}>
          <Text style={styles.ghostText}>New episode</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  card: { padding: 16, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.board, gap: 4 },
  cardLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  cardSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  rowLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text },
  rowValue: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  ghost: { paddingVertical: 8, alignItems: "center" },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
