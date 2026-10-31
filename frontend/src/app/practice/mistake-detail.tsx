import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

const LANGS = ["EN", "FR", "AR"] as const;

export default function MistakeDetailScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<(typeof LANGS)[number]>("EN");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Your mistake</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.wrong}>She go to school.</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.right}>She goes to school.</Text>
        </View>
        <Text style={styles.explanation}>He, she and it take -s in the present simple.</Text>
        <View style={styles.tabs}>
          {LANGS.map((l) => (
            <Pressable key={l} style={[styles.tab, lang === l && styles.tabOn]} onPress={() => setLang(l)}>
              <Text style={[styles.tabText, lang === l && styles.tabTextOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Practise this" onPress={() => router.push("/practice/fill-blank")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  card: { padding: 16, borderRadius: Radii.card, borderWidth: 2, borderColor: Colors.cardBorder, backgroundColor: Colors.white, gap: 6, alignItems: "center" },
  wrong: { fontFamily: Fonts.body, fontSize: 16, color: Colors.errorText },
  arrow: { fontFamily: Fonts.body, fontSize: 16, color: Colors.muted },
  right: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.primaryDark },
  explanation: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, lineHeight: 20 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.chip, backgroundColor: Colors.board },
  tabOn: { backgroundColor: Colors.amber },
  tabText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.muted },
  tabTextOn: { color: Colors.text },
});
