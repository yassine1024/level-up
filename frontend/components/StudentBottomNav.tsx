import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts } from "@/constants/theme";

type Tab = "home" | "practice" | "course" | "profile";

interface StudentBottomNavProps {
  active?: Tab | "none";
  onHomePress?: () => void;
  onPracticePress?: () => void;
  onCoursePress?: () => void;
  onProfilePress?: () => void;
}

export function StudentBottomNav({
  active = "none",
  onHomePress,
  onPracticePress,
  onCoursePress,
  onProfilePress,
}: StudentBottomNavProps) {
  const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }[] = [
    { key: "home", label: "Home", icon: "home-outline", onPress: onHomePress ?? (() => router.navigate("/home")) },
    { key: "practice", label: "Practice", icon: "locate-outline", onPress: onPracticePress ?? (() => router.navigate("/practice")) },
    { key: "course", label: "Course", icon: "book-outline", onPress: onCoursePress ?? (() => router.navigate("/course")) },
    { key: "profile", label: "Profile", icon: "person-outline", onPress: onProfilePress ?? (() => router.navigate("/profile")) },
  ];

  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={tab.onPress}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}>
            <View style={[styles.ic, selected && styles.icOn]}>
              <Ionicons
                name={tab.icon}
                size={20}
                color={selected ? Colors.primaryDark : Colors.muted}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelOn]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 76,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 2,
    borderTopColor: Colors.cardBorder,
    flexDirection: "row",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ic: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  icOn: {
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.muted,
  },
  labelOn: {
    color: Colors.primaryDark,
  },
});
