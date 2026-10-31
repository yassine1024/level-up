/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { useMe } from "@/src/hooks/useMe";
import { useCourse } from "@/src/hooks/useCourse";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/src/store/auth";
import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading, isError } = useMe();
  const courseQuery = useCourse();
  const levelLabel = courseQuery.data ? `Level ${courseQuery.data.levelId}` : "Level A1";
  const [language, setLanguage] = useState("English");
  const [name, setName] = useState("");
  const [usernameEdit, setUsernameEdit] = useState("");
  const [email, setEmail] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const CONFIRM_WORD = "DELETE";
  const deleteConfirmed = deleteValue.trim().toUpperCase() === CONFIRM_WORD;

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetY = useSharedValue(SCREEN_HEIGHT);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const progress = 1 - sheetY.value / SCREEN_HEIGHT;
    const clamped = Math.max(0, Math.min(1, progress));
    return { opacity: 0.35 * clamped };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
        // eslint-disable-next-line react-hooks/immutability
        sheetY.value = Math.max(0, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.25) {
          // eslint-disable-next-line react-hooks/immutability
          sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
            if (finished) {
              runOnJS(setShowDelete)(false);
            }
          });
        } else {
          sheetY.value = withSpring(0, { damping: 20, stiffness: 220 });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (showDelete) {
      // eslint-disable-next-line react-hooks/immutability
      sheetY.value = SCREEN_HEIGHT;
      sheetY.value = withTiming(0, { duration: 300 });
    }
  }, [showDelete, sheetY, SCREEN_HEIGHT]);

  const closeDeleteSheet = () => {
    // eslint-disable-next-line react-hooks/immutability
    sheetY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(setShowDelete)(false);
        runOnJS(setDeleteValue)("");
      }
    });
  };

  const handleDeleteAccount = () => {
    if (!deleteConfirmed || deleting) return;
    setDeleting(true);
    setTimeout(() => {
      useAuthStore.getState().logout();
      setDeleting(false);
      router.replace("/welcome");
    }, 800);
  };

  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      setName(user.username ?? "");
      setUsernameEdit(user.username ?? "");
      setEmail((user as any).email ?? "");
    }, 0);
    return () => clearTimeout(id);
  }, [user]);  if (isLoading) {
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
          <SettingNav label="Change password" onPress={() => router.push("/change-password")} />
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
          <SettingNav label="Terms of Service" onPress={() => router.push("/legal/terms")} />
          <SettingNav label="Privacy Policy" onPress={() => router.push("/legal/privacy")} />
          <SettingNav
            label="Delete account"
            danger
            onPress={() => setShowDelete(true)}
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
      {showDelete ? (
        <View style={styles.sheetOverlay}>
          <AnimatedPressable
            style={[styles.sheetBackdrop, backdropAnimatedStyle]}
            onPress={closeDeleteSheet}
          />
          <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
            <View
              style={styles.sheetHandle}
              hitSlop={{ top: 16, bottom: 16, left: 60, right: 60 }}
              {...panResponder.panHandlers}
            />
            <Text style={styles.sheetTitle}>Delete your account?</Text>
            <Text style={styles.sheetMessage}>
              This permanently removes your profile, progress and XP. This can&apos;t be undone.
            </Text>
            <Text style={styles.sheetLabel}>Type delete to confirm</Text>
            <TextInput
              style={styles.sheetInput}
              value={deleteValue}
              onChangeText={setDeleteValue}
              autoCapitalize="none"
              placeholder="delete"
              placeholderTextColor={Colors.placeholder}
            />
            <Pressable
              style={[styles.sheetDeleteBtn, (!deleteConfirmed || deleting) && styles.sheetDisabled]}
              disabled={!deleteConfirmed || deleting}
              onPress={handleDeleteAccount}>
              <Text style={styles.sheetDeleteText}>
                {deleting ? "Deleting..." : "Delete my account"}
              </Text>
            </Pressable>
            <Pressable style={styles.sheetCancelBtn} onPress={closeDeleteSheet}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
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
  saveBtn: { height: 46, borderRadius: Radii.button, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  saveText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.white },
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
  sheetOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,23,42,0.35)",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
    shadowColor: "rgba(15,23,42,0.25)",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  sheetHandle: {
    width: 64,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.text,
  },
  sheetMessage: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
  sheetLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
  sheetInput: {
    height: 48,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.errorBorder,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  sheetDeleteBtn: {
    height: 50,
    borderRadius: Radii.button,
    backgroundColor: Colors.errorText,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDisabled: {
    opacity: 0.5,
  },
  sheetDeleteText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 15,
    color: Colors.white,
  },
  sheetCancelBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryDark,
  },
});
