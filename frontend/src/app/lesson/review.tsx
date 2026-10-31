import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

const LANGS = ["EN", "FR", "AR"] as const;

export default function ReviewLessonScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<(typeof LANGS)[number]>("EN");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Review · Slide 1 of 9</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Say who you are</Text>
          <Text style={styles.cardBody}>My name is …</Text>
        </View>
        <View style={styles.tabs}>
          {LANGS.map((l) => (
            <Pressable key={l} style={[styles.tab, lang === l && styles.tabOn]} onPress={() => setLang(l)}>
              <Text style={[styles.tabText, lang === l && styles.tabTextOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Next" onPress={() => {}} />
        <Pressable style={styles.ghost} onPress={() => router.back()}>
          <Text style={styles.ghostText}>Close</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 16 },
  meta: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  card: { padding: 16, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white, gap: 6 },
  cardTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  cardBody: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.chip, backgroundColor: Colors.board },
  tabOn: { backgroundColor: Colors.amber },
  tabText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.muted },
  tabTextOn: { color: Colors.text },
  ghost: { paddingVertical: 8, alignItems: "center" },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
