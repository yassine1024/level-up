import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts, Radii } from "@/constants/theme";
import { Chip } from "@/components/Chip";

type Variant = "vocab" | "grammar";

interface SlideViewerProps {
  variant?: Variant;
  initialSlide?: number;
}

const CONTENT: Record<
  Variant,
  {
    title: string;
    bullets: string[];
    example: string;
    hint: string;
    exercise: string;
    options: string[];
    initial: number;
  }
> = {
  vocab: {
    title: "Say who you are",
    bullets: ["My name is …", "I am from …", "I am … years old."],
    example: "Hello! My name is Sara. I am from Oran.",
    hint: "Hint (FR): Je m'appelle … · Je viens de … · J'ai … ans.",
    exercise: "Complete: My ____ is Amine.",
    options: ["name", "nice", "from"],
    initial: 3,
  },
  grammar: {
    title: "Verb to be: am, is, are",
    bullets: ["I am", "You are", "He, she, it is"],
    example: "She is from Algiers. We are students.",
    hint: "Hint (FR): je suis · tu es · il/elle est · nous sommes.",
    exercise: "Choose: They ____ friends.",
    options: ["is", "are", "am"],
    initial: 5,
  },
};

const TOTAL_SLIDES = 9;

export function SlideViewer({ variant = "vocab", initialSlide }: SlideViewerProps) {
  const insets = useSafeAreaInsets();
  const content = CONTENT[variant];
  const [slide, setSlide] = useState(initialSlide ?? content.initial);
  const [lang, setLang] = useState<"EN" | "FR" | "AR">("EN");

  const handleBack = () => {
    if (slide > 0) setSlide((s) => s - 1);
  };
  const handleNext = () => {
    if (slide < TOTAL_SLIDES - 1) setSlide((s) => s + 1);
    else router.push("/lesson/complete");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
            accessibilityLabel="Close lesson">
            <Ionicons name="close" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i <= slide ? styles.progressFilled : styles.progressEmpty,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Slide meta */}
        <View style={styles.metaRow}>
          <Text style={styles.slideLabel}>
            Slide {slide + 1} of {TOTAL_SLIDES}
          </Text>
          <View style={styles.langRow}>
            {(["EN", "FR", "AR"] as const).map((l) => (
              <Pressable key={l} onPress={() => setLang(l)}>
                <Chip
                  label={l}
                  variant={lang === l ? "default" : "grey"}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.title}>{content.title}</Text>

        <View style={styles.bullets}>
          {content.bullets.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleLabel}>Example</Text>
          <Text style={styles.exampleText}>{content.example}</Text>
        </View>

        <Text style={styles.hint}>{content.hint}</Text>

        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseLabel}>Mini exercise</Text>
          <Text style={styles.exerciseQuestion}>{content.exercise}</Text>
          <View style={styles.optionsRow}>
            {content.options.map((opt) => (
              <View key={opt} style={styles.optionChip}>
                <Chip label={opt} variant="grey" />
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        <View style={styles.navRow}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 14,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressFilled: {
    backgroundColor: Colors.primary,
  },
  progressEmpty: {
    backgroundColor: Colors.cardBorder,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  slideLabel: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.text,
  },
  langRow: {
    flexDirection: "row",
    gap: 6,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.text,
  },
  bullets: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.amber,
    marginTop: 7,
  },
  bulletText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.text,
    flex: 1,
  },
  exampleCard: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: "#BFE3D1",
    borderRadius: Radii.card,
    padding: 16,
  },
  exampleLabel: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  exampleText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.text,
    marginTop: 4,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontStyle: "italic",
    color: Colors.muted,
    paddingHorizontal: 2,
  },
  exerciseCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.card,
    padding: 16,
    gap: 4,
  },
  exerciseLabel: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 12,
    color: Colors.amberDark,
  },
  exerciseQuestion: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginVertical: 4,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {},
  navRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    width: 120,
    height: 54,
    borderRadius: Radii.button,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.primaryDark,
  },
  nextButton: {
    flex: 1,
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nextButtonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.white,
  },
});
