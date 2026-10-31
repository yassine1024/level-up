import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { StudentBottomNav } from "@/components/StudentBottomNav";

const SIZE = 6;
const CANDY_COLORS = ["#FB7185", "#38BDF8", "#34D399", "#FBBF24", "#A78BFA"];
const CANDY_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  "heart",
  "diamond",
  "leaf",
  "star",
  "flash",
];

const QUESTIONS = [
  { question: "She ___ to school every day.", options: ["go", "goes", "going"], answer: 1 },
  { question: "What is the plural of child?", options: ["childs", "children", "childes"], answer: 1 },
  { question: "I ___ a cute dog.", options: ["have", "has", "is"], answer: 0 },
  { question: "They ___ playing soccer.", options: ["is", "are", "am"], answer: 1 },
  { question: "Yesterday, he ___ an apple.", options: ["eat", "ate", "eaten"], answer: 1 },
  { question: "Look at ___ birds!", options: ["that", "those", "this"], answer: 1 },
  { question: "This cake is ___ than that one.", options: ["sweet", "sweeter", "sweetest"], answer: 1 },
  { question: "___ you speak English?", options: ["Do", "Does", "Is"], answer: 0 },
  { question: "We ___ hungry right now.", options: ["are", "is", "was"], answer: 0 },
  { question: "Cats usually ___ milk.", options: ["likes", "like", "liking"], answer: 1 },
];

type Tile = { id: number; color: number };
type Position = { row: number; col: number };

function createBoard(): Tile[][] {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({
      id: row * SIZE + col,
      color: (row * 3 + col * 2 + row + col) % CANDY_COLORS.length,
    }))
  );
}

function areAdjacent(a: Position, b: Position) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export default function GrammarCrushScreen() {
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState(createBoard);
  const [selected, setSelected] = useState<Position | null>(null);
  const [pending, setPending] = useState<{ first: Position; second: Position } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const question = QUESTIONS[questionIndex % QUESTIONS.length];

  const flatBoard = useMemo(() => board.flat(), [board]);

  const restart = () => {
    setBoard(createBoard());
    setSelected(null);
    setPending(null);
    setFeedback(null);
    setScore(0);
    setStreak(0);
  };

  const selectTile = (position: Position) => {
    if (pending) return;
    if (!selected) {
      setSelected(position);
      return;
    }
    if (!areAdjacent(selected, position)) {
      setSelected(position);
      return;
    }
    setPending({ first: selected, second: position });
    setSelected(null);
    setQuestionIndex((index) => index + 1);
    setFeedback(null);
  };

  const answer = (index: number) => {
    if (!pending) return;
    if (index !== question.answer) {
      setFeedback("Not quite. Choose another swap.");
      setStreak(0);
      setPending(null);
      return;
    }

    const next = board.map((row) => row.map((tile) => ({ ...tile })));
    const first = next[pending.first.row][pending.first.col];
    next[pending.first.row][pending.first.col] = next[pending.second.row][pending.second.col];
    next[pending.second.row][pending.second.col] = first;
    setBoard(next);
    setScore((value) => value + 10);
    setStreak((value) => value + 1);
    setFeedback("Correct! Nice swap.");
    setPending(null);
  };

  const level = Math.floor(score / 50) + 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Grammar Crush</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Answer correctly to make your swap move.</Text>

        <View style={styles.stats}>
          <Stat label="Score" value={String(score)} color={Colors.primaryDark} />
          <Stat label="Streak" value={String(streak)} color={Colors.amberDark} />
          <Stat label="Level" value={String(level)} color={Colors.fancy} />
        </View>

        <View style={styles.board}>
          {flatBoard.map((tile, index) => {
            const position = { row: Math.floor(index / SIZE), col: index % SIZE };
            const isSelected =
              selected?.row === position.row && selected?.col === position.col;
            return (
              <Pressable
                key={tile.id}
                onPress={() => selectTile(position)}
                style={[
                  styles.tile,
                  { backgroundColor: CANDY_COLORS[tile.color] },
                  isSelected && styles.tileSelected,
                ]}>
                <Ionicons name={CANDY_ICONS[tile.color]} size={20} color={Colors.white} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={restart}>
            <Ionicons name="refresh" size={17} color={Colors.primaryDark} />
            <Text style={styles.actionText}>Restart</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => setFeedback("Pick two touching tiles to swap.")}>
            <Ionicons name="bulb-outline" size={17} color={Colors.amberDark} />
            <Text style={styles.actionText}>Hint</Text>
          </Pressable>
        </View>
      </ScrollView>

      {pending ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.questionIcon}>
              <Text style={styles.questionMark}>?</Text>
            </View>
            <Text style={styles.eyebrow}>Answer to move</Text>
            <Text style={styles.question}>{question.question}</Text>
            {question.options.map((option, index) => (
              <Pressable key={option} style={styles.answerButton} onPress={() => answer(index)}>
                <Text style={styles.answerText}>{option}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.primaryDark} />
              </Pressable>
            ))}
            {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          </View>
        </View>
      ) : null}

      <StudentBottomNav
        active="practice"
        onCoursePress={() => router.navigate("/course")}
        onPracticePress={() => {}}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerSpacer: { width: 24 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.text },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, textAlign: "center" },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    paddingVertical: 12,
  },
  stat: { alignItems: "center", minWidth: 70 },
  statLabel: { fontFamily: Fonts.bodyHeavy, fontSize: 11, color: Colors.muted, textTransform: "uppercase" },
  statValue: { fontFamily: Fonts.heading, fontSize: 24, marginTop: 2 },
  board: {
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    padding: 8,
    backgroundColor: Colors.board,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
  },
  tile: {
    width: "15.25%",
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "rgba(15,23,42,0.15)",
  },
  tileSelected: { borderWidth: 3, borderColor: Colors.amber, transform: [{ scale: 0.9 }] },
  actions: { flexDirection: "row", justifyContent: "center", gap: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.button,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: { fontFamily: Fonts.bodyHeavy, fontSize: 13, color: Colors.text },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,23,42,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    padding: 22,
    gap: 10,
  },
  questionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  questionMark: { fontFamily: Fonts.heading, fontSize: 25, color: Colors.primaryDark },
  eyebrow: { fontFamily: Fonts.bodyHeavy, fontSize: 11, color: Colors.primaryDark, textAlign: "center", textTransform: "uppercase" },
  question: { fontFamily: Fonts.heading, fontSize: 20, lineHeight: 26, color: Colors.text, textAlign: "center", marginBottom: 4 },
  answerButton: {
    minHeight: 48,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.board,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.text },
  feedback: { fontFamily: Fonts.bodyBold, color: Colors.primaryDark, textAlign: "center", marginTop: 4 },
});
