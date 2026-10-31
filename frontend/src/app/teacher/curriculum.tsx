import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherCurriculumScreen() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>New unit</Text>
        </View>
        <Input label="Level (A1)" value={level} onChangeText={setLevel} placeholder="A1" />
        <Input label="Unit title" value={unitTitle} onChangeText={setUnitTitle} placeholder="Meeting people" />
        <Input label="Lesson title" value={lessonTitle} onChangeText={setLessonTitle} placeholder="Introducing yourself" />
        <Button title="Create" onPress={() => {}} disabled={!level.trim() || !unitTitle.trim()} />
        <Pressable style={styles.ghost} onPress={() => {}}>
          <Text style={styles.ghostText}>Add another lesson</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  ghost: { paddingVertical: 8, alignItems: "center" },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
