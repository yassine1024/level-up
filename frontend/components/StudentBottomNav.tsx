import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts } from "@/constants/theme";

type Tab = "course" | "practice";

interface StudentBottomNavProps {
  active?: Tab | "none";
  onCoursePress?: () => void;
  onPracticePress?: () => void;
}

export function StudentBottomNav({
  active = "none",
  onCoursePress,
  onPracticePress,
}: StudentBottomNavProps) {
  return (
    <View style={styles.nav}>
      <Pressable
        onPress={onCoursePress}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === "course" }}>
        <View style={[styles.ic, active === "course" && styles.icOn]}>
          <Ionicons
            name="book-outline"
            size={20}
            color={active === "course" ? Colors.primaryDark : Colors.muted}
          />
        </View>
        <Text
          style={[
            styles.label,
            active === "course" && styles.labelOn,
          ]}>
          Course
        </Text>
      </Pressable>
      <Pressable
        onPress={onPracticePress}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === "practice" }}>
        <View style={[styles.ic, active === "practice" && styles.icOn]}>
          <Ionicons
            name="locate-outline"
            size={20}
            color={active === "practice" ? Colors.primaryDark : Colors.muted}
          />
        </View>
        <Text
          style={[
            styles.label,
            active === "practice" && styles.labelOn,
          ]}>
          Practice
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 76,
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
