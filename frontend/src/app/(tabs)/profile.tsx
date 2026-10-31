import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useMe } from "@/src/hooks/useMe";
import { mapApiError, friendlyMessage } from "@/src/api/errors";

export default function ProfileScreen() {
  const { data: user, isLoading, isError, error } = useMe();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View style={styles.center}>
        <Text>{isError ? friendlyMessage(mapApiError(error)) : "Could not load profile."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.username}</Text>
      <Text style={styles.row}>Role: {user.role ?? "—"}</Text>
      <Text style={styles.row}>ID: {user.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  row: { fontSize: 16, marginBottom: 8 },
});