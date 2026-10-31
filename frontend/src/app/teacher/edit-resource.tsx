import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { UploadField } from "@/components/UploadField";
import { Colors, Fonts, Radii } from "@/constants/theme";
import type { PickedDocument } from "@/src/types/api";

export default function EditResourceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ resourceId?: string }>();
  const [title, setTitle] = useState("Resource " + (params.resourceId ?? ""));
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<PickedDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 800);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Edit resource</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Resource title"
        placeholderTextColor={Colors.placeholder}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: "top" }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional description"
        placeholderTextColor={Colors.placeholder}
        multiline
      />

      <Text style={styles.label}>File</Text>
      <UploadField
        label="Replace file"
        value={file}
        onChange={setFile}
        accept={["application/pdf"]}
        extensions={["pdf"]}
      />

      {saved ? (
        <View style={styles.successCard}>
          <Text style={styles.successText}>Resource updated.</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <Button
          title={saving ? "Saving..." : "Save changes"}
          disabled={saving}
          onPress={handleSave}
        />
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 12, backgroundColor: Colors.background, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  label: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text, marginTop: 4 },
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
  successCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 16,
  },
  successText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.primaryDark },
});
