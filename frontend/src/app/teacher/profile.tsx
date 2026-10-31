import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMe } from "@/src/hooks/useMe";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";

export default function TeacherProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useMe();
  const [language, setLanguage] = useState("English");
  const [name, setName] = useState("");
  const [usernameEdit, setUsernameEdit] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      setName(user.username ?? "");
      setUsernameEdit(user.username ?? "");
      setEmail((user as any).email ?? "");
    }, 0);
    return () => clearTimeout(id);
  }, [user]);
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
        <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <View style={{ marginTop: 12 }}>
          <Input label="Username" value={usernameEdit} onChangeText={setUsernameEdit} placeholder="Your username" />
        </View>
        <View style={{ marginTop: 12 }}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        </View>
        <View style={{ marginTop: 16 }}>
          <Pressable
            style={styles.saveBtn}
            onPress={() => Alert.alert("Saved", "Profile updated (local).")}>
            <Text style={styles.saveText}>Save profile</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable style={styles.row} onPress={() => router.push("/change-password")}>
          <Text style={styles.rowLabel}>Change password</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={() =>
            Alert.alert("App language", "Choose a language", [
              { text: "English", onPress: () => setLanguage("English") },
              { text: "Français", onPress: () => setLanguage("Français") },
              { text: "العربية", onPress: () => setLanguage("العربية") },
              { text: "Cancel", style: "cancel" },
            ])
          }>
          <Text style={styles.rowLabel}>App language</Text>
          <Text style={styles.rowValue}>{language}</Text>
        </Pressable>
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
  saveBtn: { height: 46, borderRadius: Radii.button, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  saveText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.white },
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
