import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Chip } from "@/components/Chip";
import { Ionicons } from "@expo/vector-icons";

export default function PracticeHomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Chip label="Level A1" variant="amber" />
        </View>
        <Text style={styles.subtitle}>Choose how you want to practise today.</Text>

        <Pressable style={styles.card} onPress={() => router.push("/practice/roleplay")}>
          <View style={styles.cardIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Role-play chat</Text>
            <Text style={styles.cardSub}>Chat with a character. It fixes your mistakes and explains why.</Text>
          </View>
          <Text style={styles.meet}>Meet the character</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push("/practice/games")}>
          <View style={styles.cardIcon}>
            <Ionicons name="game-controller" size={22} color={Colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Games</Text>
            <Text style={styles.cardSub}>Games and tasks made from your lessons.</Text>
          </View>
          <Text style={styles.meet}>Open games</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push("/practice/writing")}>
          <View style={styles.cardIcon}>
            <Ionicons name="create-outline" size={22} color={Colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Writing</Text>
            <Text style={styles.cardSub}>Write and get feedback on your answers.</Text>
          </View>
          <Text style={styles.meet}>Open</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push("/practice/mistakes")}>
          <View style={styles.cardIcon}>
            <Ionicons name="alert-circle-outline" size={22} color={Colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Your mistakes</Text>
            <Text style={styles.cardSub}>Review mistakes and explanations.</Text>
          </View>
          <Text style={styles.meet}>Open</Text>
        </Pressable>
      </ScrollView>
      <StudentBottomNav active="practice" onCoursePress={() => router.navigate("/course")} onPracticePress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, marginTop: -4 },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.text },
  cardSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginTop: 2 },
  meet: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.primaryDark },
});