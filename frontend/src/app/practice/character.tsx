import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { studentApi } from "@/src/api/endpoints";
import type { CharacterReply } from "@/src/types/api";
import { useCourse } from "@/src/hooks/useCourse";

const API_MODE = process.env.EXPO_PUBLIC_API_MODE ?? "mock";

interface Message {
  role: "user" | "assistant" | "correction";
  text: string;
  correction?: CharacterReply["correction"];
}

export default function PracticeCharacterScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<"intro" | "chat" | "summary" | "error">("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [episodeId, setEpisodeId] = useState<number | null>(null);
  const [emotion, setEmotion] = useState("neutral");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const courseQuery = useCourse();
  const lessonId = courseQuery.data?.currentUnit?.currentLesson?.id ?? 1012;

  const startChat = async () => {
    setSending(true);
    try {
      if (API_MODE === "mock") {
        setEpisodeId(1);
        setPhase("chat");
        setMessages([{ role: "assistant", text: "Hi! I am Yasmine. What did you have for dinner last night?" }]);
        return;
      }
      const episode = await studentApi.startCharacterEpisode(lessonId, "cousin", "At a family dinner");
      setEpisodeId(episode.episodeId);
      setPhase("chat");
      setMessages([{ role: "assistant", text: episode.openingLine }]);
    } catch {
      setPhase("error");
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    if (!episodeId) return;
    setSending(true);
    try {
      if (API_MODE === "mock") {
        setMessages((m) => [...m,
          {
            role: "correction",
            text: "",
            correction: {
              original: "I eat chicken and rice yesterday.",
              corrected: "I ate chicken and rice yesterday.",
              explanation: {
                en: "For yesterday, use the past simple: eat becomes ate.",
                fr: "",
                ar: "",
              },
              focus: "past simple",
              segments: [],
            },
          },
          { role: "assistant", text: "Nice! Did you cook it yourself?" },
        ]);
        return;
      }
      const response = await studentApi.sendCharacterMessage(episodeId, text);
      setEmotion(response.emotion);
      setSuggestions(response.nextInput.suggestions);
      if (response.correction) {
        setMessages((m) => [...m, { role: "correction", text: "", correction: response.correction }]);
      }
      setMessages((m) => [...m, { role: "assistant", text: response.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I could not reply." }]);
    } finally {
      setSending(false);
    }
  };

  if (phase === "intro") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>Role-play</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>TODAY&apos;S EPISODE</Text>
            <Text style={styles.episodeTitle}>Dinner talk with Yasmine</Text>
            <Text style={styles.bodyText}>
              You and Yasmine are at the table. She wants to know about your
              evening. Answer in English. She will fix your mistakes.
            </Text>
            <View style={styles.tags}>
              <Text style={styles.tag}>Food words</Text>
              <Text style={styles.tag}>Past simple</Text>
              <Text style={styles.tag}>Present simple</Text>
            </View>
          </View>
          <Button title="Start chatting" onPress={startChat} />
        </ScrollView>
        <StudentBottomNav
          active="practice"
          onCoursePress={() => router.navigate("/course")}
          onPracticePress={() => {}}
        />
      </View>
    );
  }

  if (phase === "error") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>Yasmine</Text>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.bodyText}>The chat took too long to respond. Try again.</Text>
            <View style={{ marginTop: 16 }}>
              <Button title="Retry" onPress={() => { setPhase("intro"); }} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === "summary") {
    const userMsgs = messages.filter((m) => m.role === "user").length;
    const corrections = messages.filter((m) => m.role === "correction").length;
    const progress = Math.min(100, 40 + userMsgs * 10);
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>Session summary</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>RECAP</Text>
            <Text style={styles.episodeTitle}>Dinner talk with Yasmine</Text>
            <Text style={styles.bodyText}>Expressions learned: {userMsgs + 2}</Text>
            <Text style={styles.bodyText}>Mistakes corrected: {corrections}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.bodyText}>Progress</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.bodyText}>{progress}%</Text>
            </View>
          </View>
          <Button title="Continue" onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Yasmine</Text>
          <Pressable onPress={() => setPhase("summary")}>
            <Text style={styles.finishText}>Finish</Text>
          </Pressable>
        </View>
        <Text style={styles.emotion}>Feeling {emotion}</Text>
        {messages.map((m, i) => {
          if (m.role === "correction" && m.correction) {
            return (
              <View key={i} style={styles.correctionCard}>
                <Text style={styles.correctionLabel}>Small fix</Text>
                <View style={styles.correctionRow}>
                  <Text style={styles.correctionWrong}>{m.correction.original}</Text>
                  <Text style={styles.correctionRight}>{m.correction.corrected}</Text>
                </View>
                <Text style={styles.correctionExplanation}>
                  {m.correction.explanation.en}
                </Text>
                <View style={styles.correctionLangRow}>
                  {(["EN", "FR", "AR"] as const).map((lang) => (
                    <Text key={lang} style={styles.correctionLang}>
                      {lang === "EN" ? "EN" : lang === "FR" ? "FR" : "AR"}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }
          return (
            <View
              key={i}
              style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
              <Text style={m.role === "user" ? styles.userText : styles.assistantText}>
                {m.text}
              </Text>
            </View>
          );
        })}
        {suggestions.length > 0 ? (
          <View style={styles.suggestionRow}>
            {suggestions.map((suggestion) => (
              <Pressable key={suggestion} style={styles.suggestion} onPress={() => setInput(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your answer…"
            placeholderTextColor={Colors.placeholder}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage} disabled={sending}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </ScrollView>
      <StudentBottomNav
        active="practice"
        onCoursePress={() => router.navigate("/course")}
        onPracticePress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 8,
  },
  eyebrow: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  episodeTitle: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.text },
  bodyText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.input,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderRadius: Radii.card,
    padding: 12,
    maxWidth: "80%",
  },
  userText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.white },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 12,
    maxWidth: "80%",
  },
  assistantText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    height: 48,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.input,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  correctionCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 14,
    gap: 6,
    maxWidth: "90%",
  },
  correctionLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  correctionSentence: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  correctionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  correctionWrong: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: "#C8401C",
    textDecorationLine: "line-through",
  },
  correctionRight: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 15,
    color: "#2563EB",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  correctionRest: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text },
  correctionExplanation: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  correctionLangRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  correctionLang: { fontFamily: Fonts.bodyHeavy, fontSize: 12, color: Colors.muted },
  emotion: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  finishText: { fontFamily: Fonts.bodyHeavy, fontSize: 14, color: Colors.primaryDark },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.disabled, overflow: "hidden", marginTop: 4 },
  progressFill: { height: 8, backgroundColor: Colors.primary },
  suggestionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestion: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  suggestionText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.text },
});