import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";

export default function JoinClassScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🎓</Text>
        </View>
        <Text style={styles.title}>Join your teacher</Text>
        <Text style={styles.subtitle}>Ask your teacher for the class code.</Text>
        <Input label="Class code" value={code} onChangeText={setCode} placeholder="LSN-4821" />
        <Button title="Join class" onPress={() => router.push("/class-joined")} disabled={!code.trim()} />
        <Pressable style={styles.ghost} onPress={() => router.back()}>
          <Text style={styles.ghostText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, gap: 16, alignItems: "center" },
  iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.board, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 44 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text, textAlign: "center" },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, textAlign: "center" },
  ghost: { paddingVertical: 8 },
  ghostText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.primaryDark },
});
