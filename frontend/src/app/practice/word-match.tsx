import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

const PAIRS = ["name  ↔  nom", "from  ↔  de", "age  ↔  âge"];

export default function WordMatchScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Word match</Text>
        </View>
        {PAIRS.map((p) => (
          <View key={p} style={styles.row}>
            <Text style={styles.pair}>{p}</Text>
          </View>
        ))}
        <Text style={styles.meta}>2 of 3 pairs matched</Text>
        <Button title="Check" onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  row: { padding: 14, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  pair: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  meta: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
});
