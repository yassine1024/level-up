import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const ROWS = [
  { icon: "person-outline", label: "Profile", sub: "Name, school" },
  { icon: "language-outline", label: "App language", sub: "English · Français · العربية" },
  { icon: "lock-closed-outline", label: "Change password" },
  { icon: "document-text-outline", label: "Terms and Privacy" },
  { icon: "log-out-outline", label: "Log out" },
];

export default function TeacherSettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>
        {ROWS.map((row) => (
          <Pressable key={row.label} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon as any} size={20} color={Colors.primaryDark} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </Pressable>
        ))}
        <Pressable style={styles.danger} onPress={() => router.push("/profile/delete-account")}>
          <Text style={styles.dangerText}>Delete account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.board, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  rowSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  danger: { marginTop: 8, padding: 14, borderRadius: Radii.card, backgroundColor: Colors.errorBg, alignItems: "center" },
  dangerText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.errorText },
});
