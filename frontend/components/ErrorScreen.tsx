import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Colors } from "@/constants/theme";

interface ErrorScreenProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showHome?: boolean;
}

export function ErrorScreen({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  showHome = true,
}: ErrorScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <ErrorState title={title} description={description} onRetry={onRetry} retryLabel={retryLabel} />
      {showHome ? (
        <View style={styles.homeWrap}>
          <Button title="Go home" variant="ghost" onPress={() => router.replace("/home")} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  homeWrap: { paddingHorizontal: 24, paddingBottom: 24 },
});
