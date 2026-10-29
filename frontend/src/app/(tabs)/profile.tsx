import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading, isError } = useMe();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  if (isLoading) {
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
    <ScrollView
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{user.username}</Text>
      <Text style={styles.subtitle}>{user.role ?? "Student"}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingRow
          label="Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingRow
          label="Sound effects"
          value={sound}
          onValueChange={setSound}
        />
        <SettingLink label="Speech speed" value="Normal" />
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
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
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
  body: { padding: 24, gap: 16, backgroundColor: Colors.background, flexGrow: 1 },
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
