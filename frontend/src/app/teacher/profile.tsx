import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function TeacherProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useMe();

  return (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{user?.username ?? "Teacher"}</Text>
      <Text style={styles.subtitle}>Teacher</Text>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>3 courses</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{user?.username ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{(user as any)?.email ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable style={styles.row} onPress={() => {}}>
          <Text style={styles.rowLabel}>Change password</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>App language</Text>
          <Text style={styles.rowValue}>English · Français · العربية</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.row} onPress={() => router.push("/legal/terms")}>
          <Text style={styles.rowLabel}>Terms of Service</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push("/legal/privacy")}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={() => router.push("/profile/delete-account")}>
          <Text style={[styles.rowLabel, styles.danger]}>Delete account</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16 }}>
        <Pressable
          style={styles.logout}
          onPress={() => {
            useAuthStore.getState().logout();
            router.replace("/welcome");
          }}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 16, backgroundColor: Colors.background, flexGrow: 1 },
  bubble: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.amber },
  bubbleText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  section: { gap: 8, marginTop: 8 },
  sectionTitle: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.muted, marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  rowLabel: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.text },
  rowValue: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  chevron: { fontFamily: Fonts.bodyHeavy, fontSize: 20, color: Colors.muted },
  danger: { color: Colors.errorText },
  logout: {
    height: 50,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.errorBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.errorBg,
  },
  logoutText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.errorText },
});
