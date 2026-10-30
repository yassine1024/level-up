import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMe } from "@/src/hooks/useMe";
import { useCourse } from "@/src/hooks/useCourse";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading, isError } = useMe();
  const courseQuery = useCourse();
  const levelLabel = courseQuery.data ? `Level ${courseQuery.data.levelId}` : "Level A1";  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View style={styles.center}>
        <Text>Could not load profile.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 96 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{user.username}</Text>
        <Text style={styles.subtitle}>{user.role ?? "Student"}</Text>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{levelLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{user.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{(user as any).email ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <SettingNav label="Change password" onPress={() => {}} />
          <SettingLink label="App language" value="English · Français · العربية" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingNav label="Terms of Service" onPress={() => router.push("/legal/terms")} />
          <SettingNav label="Privacy Policy" onPress={() => router.push("/legal/privacy")} />
          <SettingNav
            label="Delete account"
            danger
            onPress={() => router.push("/profile/delete-account")}
          />
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
      <StudentBottomNav active="profile" />
    </View>
  );
}

function SettingLink({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SettingNav({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 24, gap: 16, backgroundColor: Colors.background, flexGrow: 1 },
  bubble: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primaryLight },
  bubbleText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.primaryDark },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
