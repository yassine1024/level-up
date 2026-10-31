import {
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { TextArea } from "@/components/TextArea";
import { UploadField } from "@/components/UploadField";
import {
  useLessonLevels,
  useLessonUnits,
  useLessons,
  useSaveResources,
} from "@/src/hooks/useTeacherCourse";
import { useMe } from "@/src/hooks/useMe";
import { useAuthStore } from "@/src/store/auth";
import { useTeacherStore } from "@/src/store/teacher";
import { Colors, Fonts, Radii } from "@/constants/theme";
import type {
  ResourceFileField,
  SaveResourcesPayload,
  SavedResourceLine,
} from "@/src/types/api";

/** Slots that accept a file, in the order they appear on the screen. */
const FILE_FIELDS: ResourceFileField[] = [
  "vocabulary",
  "grammar",
  "pronunciation",
  "listening1",
  "listening2",
  "other",
];

const FILE_LABELS: Record<ResourceFileField, string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  listening1: "Listening 1",
  listening2: "Listening 2",
  other: "Other",
};

const DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const DOC_EXTENSIONS = ["pdf", "docx", "txt"];

export default function CourseResourcesScreen() {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const me = useMe({ enabled: !!token });

  const draft = useTeacherStore((s) => s.draft);
  const setDraft = useTeacherStore((s) => s.setDraft);
  const setFile = useTeacherStore((s) => s.setFile);
  const setLastSaved = useTeacherStore((s) => s.setLastSaved);

  const levelsQuery = useLessonLevels();
  const unitsQuery = useLessonUnits(draft.level?.id ?? null);
  const lessonsQuery = useLessons(draft.unit?.id ?? null);
  const save = useSaveResources();

  const levelOptions: SelectOption[] = (levelsQuery.data?.items ?? []).map(
    (level) => ({ label: `${level.id} · ${level.name}`, value: level.id })
  );
  const unitOptions: SelectOption[] = (unitsQuery.data?.items ?? []).map(
    (unit) => ({ label: `Unit ${unit.number} · ${unit.title}`, value: String(unit.id) })
  );
  const lessonOptions: SelectOption[] = (lessonsQuery.data?.items ?? []).map(
    (lesson) => ({
      label: `Lesson ${lesson.number} · ${lesson.title}`,
      value: String(lesson.id),
    })
  );

  const isDemo =
    levelsQuery.data?.isDemo === true ||
    unitsQuery.data?.isDemo === true ||
    lessonsQuery.data?.isDemo === true;

  const handleLevel = (value: string) => {
    const level = levelsQuery.data?.items.find((l) => l.id === value) ?? null;
    setDraft({ level, unit: null, lesson: null });
  };

  const handleUnit = (value: string) => {
    const unit =
      unitsQuery.data?.items.find((u) => String(u.id) === value) ?? null;
    setDraft({ unit, lesson: null });
  };

  const handleLesson = (value: string) => {
    const lesson =
      lessonsQuery.data?.items.find((l) => String(l.id) === value) ?? null;
    setDraft({ lesson });
  };

  const buildPayload = (): SaveResourcesPayload => {
    const payload: SaveResourcesPayload = {
      writingDescription: draft.writingDescription,
      otherDescription: draft.otherDescription,
    };
    for (const field of FILE_FIELDS) {
      const doc = draft.files[field];
      if (doc) payload[field] = { ...doc, field };
    }
    return payload;
  };

  const buildLines = (): SavedResourceLine[] => {
    const lines: SavedResourceLine[] = [];
    for (const field of FILE_FIELDS) {
      const doc = draft.files[field];
      if (doc) {
        lines.push({ text: `${FILE_LABELS[field]} · ${doc.fileName}` });
      }
    }
    if (draft.writingDescription.trim()) {
      lines.push({ text: "Writing description" });
    }
    return lines;
  };

  const handleSave = async () => {
    if (!draft.lesson) return;
    try {
      await save.mutateAsync({
        lessonId: draft.lesson.id,
        payload: buildPayload(),
      });
      setLastSaved({
        levelLabel: draft.level?.id ?? "",
        unitLabel: draft.unit ? `Unit ${draft.unit.number}` : "",
        lessonLabel: draft.lesson ? `Lesson ${draft.lesson.number}` : "",
        lines: buildLines(),
        isDemo,
      });
      router.push("/teacher/saved");
    } catch {
      // The error is surfaced below through save.isError.
    }
  };

  const saveErrorMessage = (() => {
    const error = save.error as
      | {
          response?: { data?: { detail?: string; error?: string } };
          message?: string;
        }
      | null;
    return (
      error?.response?.data?.detail ??
      error?.response?.data?.error ??
      error?.message ??
      "Could not save the lesson. Check your connection and try again."
    );
  })();

  const initials = (me.data?.username ?? "TA").slice(0, 2).toUpperCase();
  const [view, setView] = useState<"upload" | "list">("upload");

  if (view === "list") {
    return (
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Chip label="Teacher" variant="amber" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable onPress={() => router.push("/teacher/students")}>
              <Text style={styles.studentsLink}>Students</Text>
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.title}>Course resources</Text>
        <View style={styles.toggleRow}>
          <Pressable style={[styles.toggleBtn, styles.toggleBtnInactive]} onPress={() => setView("upload")}>
            <Text style={styles.toggleText}>Upload</Text>
          </Pressable>
          <Pressable style={styles.toggleBtn} onPress={() => setView("list")}>
            <Text style={styles.toggleText}>List</Text>
          </Pressable>
        </View>
        {["Vocabulary", "Grammar", "Pronunciation", "Listening 1", "Listening 2", "Other"].map((label, i) => (
          <View key={label} style={styles.listCard}>
            <Text style={styles.listLabel}>{label}</Text>
            <Pressable onPress={() => router.push({ pathname: "/teacher/edit-resource", params: { resourceId: String(i + 1) } })}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Chip label="Teacher" variant="amber" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable onPress={() => router.push("/teacher/students")}>
              <Text style={styles.studentsLink}>Students</Text>
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Course resources</Text>
        <Text style={styles.subtitle}>
          Pick a lesson, then add the files your students will learn from.
        </Text>

        <View style={styles.toggleRow}>
          <Pressable style={styles.toggleBtn} onPress={() => setView("upload")}>
            <Text style={styles.toggleText}>Upload</Text>
          </Pressable>
          <Pressable style={[styles.toggleBtn, styles.toggleBtnInactive]} onPress={() => setView("list")}>
            <Text style={styles.toggleText}>List</Text>
          </Pressable>
        </View>

        {isDemo ? (
          <Chip label="Demo data" variant="grey" style={{ alignSelf: "flex-start" }} />
        ) : null}

        <SelectField
          label="Choose a level"
          value={
            draft.level ? `${draft.level.id} · ${draft.level.name}` : undefined
          }
          options={levelOptions}
          onSelect={handleLevel}
          loading={levelsQuery.isLoading}
        />

        <SelectField
          label="Choose a unit"
          value={
            draft.unit
              ? `Unit ${draft.unit.number} · ${draft.unit.title}`
              : undefined
          }
          options={unitOptions}
          onSelect={handleUnit}
          disabled={!draft.level}
          loading={unitsQuery.isLoading}
        />

        <SelectField
          label="Choose a lesson"
          value={
            draft.lesson
              ? `Lesson ${draft.lesson.number} · ${draft.lesson.title}`
              : undefined
          }
          options={lessonOptions}
          onSelect={handleLesson}
          disabled={!draft.unit}
          loading={lessonsQuery.isLoading}
        />

        <View style={styles.divider} />

        <UploadField
          label="Vocabulary"
          hint="PDF · DOCX · TXT"
          accept={DOC_TYPES}
          extensions={DOC_EXTENSIONS}
          value={draft.files.vocabulary}
          onChange={(doc) => setFile("vocabulary", doc)}
        />

        <UploadField
          label="Grammar"
          hint="PDF · DOCX · TXT"
          accept={DOC_TYPES}
          extensions={DOC_EXTENSIONS}
          value={draft.files.grammar}
          onChange={(doc) => setFile("grammar", doc)}
        />

        <UploadField
          label="Pronunciation"
          accept={DOC_TYPES}
          extensions={DOC_EXTENSIONS}
          value={draft.files.pronunciation}
          onChange={(doc) => setFile("pronunciation", doc)}
          comingSoon
        />

        <UploadField
          label="Listening 1"
          hint="Transcript · TXT"
          accept={["text/plain"]}
          extensions={["txt"]}
          value={draft.files.listening1}
          onChange={(doc) => setFile("listening1", doc)}
        />

        <UploadField
          label="Listening 2"
          accept={DOC_TYPES}
          extensions={DOC_EXTENSIONS}
          value={draft.files.listening2}
          onChange={(doc) => setFile("listening2", doc)}
          comingSoon
        />

        <TextArea
          label="Writing"
          placeholder="Write a description..."
          value={draft.writingDescription}
          onChangeText={(text) => setDraft({ writingDescription: text })}
        />

        <UploadField
          label="Other"
          hint="PDF · DOCX · TXT"
          accept={DOC_TYPES}
          extensions={DOC_EXTENSIONS}
          value={draft.files.other}
          onChange={(doc) => setFile("other", doc)}
        />

        <TextArea
          placeholder="Write a description..."
          accessibilityLabel="Other description"
          value={draft.otherDescription}
          onChangeText={(text) => setDraft({ otherDescription: text })}
          minHeight={72}
        />

        {save.isError ? (
          <Text style={styles.error}>
            {saveErrorMessage}
          </Text>
        ) : null}

        <Button
          title={save.isPending ? "Saving..." : "Save"}
          disabled={!draft.lesson || save.isPending}
          onPress={handleSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: {
    flexGrow: 1,
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentsLink: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark, marginRight: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.text,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  error: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.errorText,
    backgroundColor: Colors.errorBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnInactive: {
    backgroundColor: Colors.disabled,
  },
  toggleText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 14,
    color: Colors.white,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  listLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.text,
  },
  editLink: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 14,
    color: Colors.primaryDark,
  },
});
