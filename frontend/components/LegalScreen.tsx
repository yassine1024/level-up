import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { Colors, Fonts } from "@/constants/theme";

export interface LegalSection {
  title: string;
  body: string;
}

interface LegalScreenProps {
  title: string;
  lastUpdated?: string;
  sections: LegalSection[];
  onBack?: () => void;
}

export function LegalScreen({ title, lastUpdated, sections, onBack }: LegalScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {lastUpdated ? (
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        ) : null}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    height: 44,
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.text,
  },
  body: {
    padding: 24,
    gap: 16,
  },
  lastUpdated: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 8,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 16,
    color: Colors.text,
  },
  sectionBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.muted,
  },
});
