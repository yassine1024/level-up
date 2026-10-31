import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useMe } from "@/src/hooks/useMe";
import { mapApiError, friendlyMessage } from "@/src/api/errors";

export default function HomeScreen() {
  const { data: user, isLoading, isError, error } = useMe();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {friendlyMessage(mapApiError(error))}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user.username}!</Text>
      <Text style={styles.subtitle}>{user.role ?? ""}</Text>
      <Text style={styles.hint}>
        API mode: {process.env.EXPO_PUBLIC_API_MODE ?? "mock"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  hint: { fontSize: 12, color: "#999" },
  error: { color: "red" },
});