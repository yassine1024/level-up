import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts } from "@/constants/theme";

export default function PracticeHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 44 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hi Asma! 👋</Text>
        <Text style={styles.subtitle}>Your English practice companion is always here for you.</Text>

        <View style={styles.companionCard}>
          <View style={styles.companionHero} />
          <View style={styles.companionName}>
            <Text style={styles.companionNameText}>Emma</Text>
            <Ionicons name="pencil-outline" size={12.8} color={Colors.text} />
          </View>
        </View>

        <View style={styles.settingsRow}>
          {[
            { label: "Personality", value: "Friendly", bg: Colors.purpleLight, iconBg: Colors.purple },
            { label: "Voice", value: "Voice 1", bg: Colors.primaryLight, iconBg: Colors.primary },
            { label: "Difficulty", value: "Match my level", bg: Colors.greenLight, iconBg: "#E6F059" },
            { label: "Corrections", value: "During chat", bg: Colors.pinkLight, iconBg: "#F362AA" },
          ].map((s) => (
            <View key={s.label} style={[styles.settingTile, { backgroundColor: s.bg }]}>
              <View style={[styles.settingIcon, { backgroundColor: s.iconBg }]}>
                <Ionicons name="happy-outline" size={14.4} color={Colors.white} />
              </View>
              <Text style={styles.settingLabel}>{s.label}</Text>
              <Text style={styles.settingValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.invitationCard}>
          <View style={styles.invitationIcon}>
            <Ionicons name="bulb-outline" size={17.6} color={Colors.text} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.invitationTitle}>Ready for a conversation?</Text>
            <Text style={styles.invitationBody}>Choose how you want to practice and start your session with Emma!</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actionArea, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start practice</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {[
          { label: "Home", active: false },
          { label: "Practice", active: true },
          { label: "Resources", active: false },
          { label: "Profile", active: false },
        ].map((t) => (
          <View key={t.label} style={styles.tabItem}>
            <View style={[styles.tabPill, t.active && styles.tabPillActive]} />
            <Text style={[styles.tabLabel, t.active && styles.tabLabelActive]}>{t.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, gap: 12, paddingBottom: 120 },
  title: { fontFamily: Fonts.bodyHeavy, fontSize: 28, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  companionCard: { alignItems: "center", gap: 8 },
  companionHero: { width: 327, height: 170, borderRadius: 20, backgroundColor: Colors.primaryLight },
  companionName: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F7F8FA", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  companionNameText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  settingsRow: { flexDirection: "row", gap: 8 },
  settingTile: { flex: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 3, alignItems: "center", gap: 4 },
  settingIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.text, textAlign: "center" },
  settingValue: { fontFamily: Fonts.body, fontSize: 9, color: Colors.muted, textAlign: "center" },
  invitationCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  invitationIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FCE3C4", alignItems: "center", justifyContent: "center" },
  invitationTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text },
  invitationBody: { fontFamily: Fonts.body, fontSize: 11, color: Colors.text },
  actionArea: { paddingHorizontal: 24, paddingTop: 10 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
  },
  primaryButtonText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.white },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16 },
  tabPillActive: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16, backgroundColor: Colors.primaryLight },
  tabLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.muted },
  tabLabelActive: { fontFamily: Fonts.bodyHeavy, fontSize: 10, color: Colors.text },
});
