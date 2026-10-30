import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function ListeningPlayerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Dialogue at the café</Text>
        </View>
        <View style={styles.player}>
          <Text style={styles.playerText}>▶  0:12 / 0:45</Text>
          <Text style={styles.playerSub}>Play · slow · replay</Text>
        </View>
        <Text style={styles.subtitle}>Listen, then answer 3 questions.</Text>
        <Button title="Start questions" onPress={() => router.push("/practice/listening")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  player: { padding: 24, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.board, alignItems: "center", gap: 6 },
  playerText: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text },
  playerSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, textAlign: "center" },
});
