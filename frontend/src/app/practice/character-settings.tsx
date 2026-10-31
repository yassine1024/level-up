import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { Colors, Fonts, Radii } from "@/constants/theme";

const VOICES = ["Female", "Male"];
const SPEEDS = ["Slow", "Normal", "Fast"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function OptionChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          style={[styles.chip, value === o && styles.chipSelected]}
          onPress={() => onChange(o)}>
          <Text style={[styles.chipText, value === o && styles.chipTextSelected]}>
            {o}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function CharacterSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("Yasmine");
  const [voice, setVoice] = useState("Female");
  const [speed, setSpeed] = useState("Normal");
  const [difficulty, setDifficulty] = useState("Medium");

  return (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Character settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.label}>Companion name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={Colors.placeholder}
      />

      <Text style={styles.label}>Voice</Text>
      <OptionChips options={VOICES} value={voice} onChange={setVoice} />

      <Text style={styles.label}>Speed</Text>
      <OptionChips options={SPEEDS} value={speed} onChange={setSpeed} />

      <Text style={styles.label}>Difficulty</Text>
      <OptionChips options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />

      <View style={{ marginTop: 16 }}>
        <Button title="Save" onPress={() => router.back()} />
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 12, backgroundColor: Colors.background, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  label: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text, marginTop: 8 },
  input: {
    height: 52,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.text,
  },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.chip,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.muted },
  chipTextSelected: { color: Colors.primaryDark },
});
