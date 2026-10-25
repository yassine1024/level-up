import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
const API_MODE = process.env.EXPO_PUBLIC_API_MODE ?? "mock";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function PracticeCharacterScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<"intro" | "chat">("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const startChat = () => {
    setPhase("chat");
    setMessages([
      { role: "assistant", text: "Hi! I am Yasmine. What did you have for dinner last night?" },
    ]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      let reply = "";
      if (API_MODE === "mock") {
        await new Promise((r) => setTimeout(r, 600));
        reply = "Nice! Did you cook it yourself?";
      } else {
        const prompt = `You are Yasmine, a friendly English conversation partner. The student said: "${text}". Reply briefly in English and gently fix any mistakes.`;
        const res = await fetch(`${API_URL}/api/agents/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error("stream failed");
        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            reply += decoder.decode(value, { stream: true });
            setMessages((m) => {
              const last = m[m.length - 1];
              if (last && last.role === "assistant" && last.text.startsWith("__stream__")) {
                const copy = m.slice(0, -1);
                return [...copy, { role: "assistant", text: reply }];
              }
              return [...m, { role: "assistant", text: reply }];
            });
          }
        } else {
          reply = await res.text();
          setMessages((m) => [...m, { role: "assistant", text: reply }]);
        }
      }
      if (API_MODE === "mock") {
        setMessages((m) => [...m, { role: "assistant", text: reply }]);
      }
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
            <Text style={styles.eyebrow}>TODAY'S EPISODE</Text>
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
          onCoursePress={() => router.push("/course")}
          onPracticePress={() => {}}
        />
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
        </View>
        {messages.map((m, i) => (
          <View
            key={i}
            style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
            <Text style={m.role === "user" ? styles.userText : styles.assistantText}>
              {m.text}
            </Text>
          </View>
        ))}
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
        onCoursePress={() => router.push("/course")}
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
});