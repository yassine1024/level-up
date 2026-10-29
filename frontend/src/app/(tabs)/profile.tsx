import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useMe();

  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </View>
        <Text style={styles.headerTitle}>Profile & settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color={Colors.text} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.profileName}>{user?.username ?? "Asma Benali"}</Text>
          <Text style={styles.profileEmail}>{user?.username ? `${user.username}@example.com` : "asma@example.com"}</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Student</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Level B1</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="person-outline" size={18} color={Colors.text} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>Asma Benali</Text>
          </View>
          <Ionicons name="pencil-outline" size={18} color={Colors.text} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="mail-outline" size={18} color={Colors.text} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>asma@example.com</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={() => router.push("/reset-password")}>
          <View style={styles.rowIcon}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowValueBold}>Change password</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="globe-outline" size={18} color={Colors.text} />
          </View>
          <Text style={styles.rowValueBold}>Interface language</Text>
        </View>
        <View style={styles.langSelector}>
          <View style={[styles.langPill, styles.langPillActive]}>
            <Text style={styles.langPillTextActive}>English</Text>
          </View>
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>Français</Text>
          </View>
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>العربية</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, minHeight: 12 }} />

      <Pressable style={styles.logoutButton} onPress={() => { useAuthStore.getState().logout(); router.replace("/welcome"); }}>
        <Ionicons name="log-out-outline" size={20} color={Colors.text} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <Pressable style={styles.deleteRow} onPress={() => router.push("/profile/delete-account")}>
        <Ionicons name="trash-outline" size={18} color="#E5484D" />
        <Text style={styles.deleteText}>Delete account</Text>
      </Pressable>

      <View style={styles.legalRow}>
        <Text style={styles.legalLink} onPress={() => router.push("/legal/terms")}>Terms of Service</Text>
        <Text style={styles.legalDot}>·</Text>
        <Text style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>Privacy Policy</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, backgroundColor: Colors.background, paddingHorizontal: 24, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 24, color: Colors.text },
  profileCard: { flexDirection: "row", gap: 14, backgroundColor: Colors.primaryLight, borderRadius: 20, padding: 16, alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  profileName: { fontFamily: Fonts.bodyHeavy, fontSize: 18, color: Colors.text },
  profileEmail: { fontFamily: Fonts.bodyBold, fontSize: 13, color: "#374151" },
  chipRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  chip: { backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.text },
  card: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F5F6F8", alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted },
  rowValue: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  rowValueBold: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  langSelector: { flexDirection: "row", gap: 4, paddingHorizontal: 16, paddingBottom: 16 },
  langPill: { flex: 1, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  langPillActive: { backgroundColor: Colors.primaryLight },
  langPillText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.muted },
  langPillTextActive: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.text },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  logoutText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.text },
  deleteRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  deleteText: { fontFamily: Fonts.semiBold, fontSize: 14, color: "#E5484D" },
  legalRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  legalLink: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted, textDecorationLine: "underline" },
  legalDot: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted },
});
