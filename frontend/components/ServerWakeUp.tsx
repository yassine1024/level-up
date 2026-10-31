import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { apiClient } from "@/src/api/client";
import {
  WAKE_UP_MESSAGE,
  TRY_AGAIN_LABEL,
  friendlyMessage,
  mapApiError,
} from "@/src/api/errors";
import { Colors, Fonts, Radii } from "@/constants/theme";

type Status = "pending" | "ok" | "error";

export function ServerWakeUp() {
  const [status, setStatus] = useState<Status>("pending");
  const [slow, setSlow] = useState(false);
  const [lastError, setLastError] = useState<unknown>(null);

  const check = () => {
    setStatus("pending");
    setSlow(false);
    setLastError(null);
    const timer = setTimeout(() => setSlow(true), 3000);
    apiClient
      .get("/api/health", { timeout: 90000 })
      .then(() => {
        clearTimeout(timer);
        setSlow(false);
        setStatus("ok");
      })
      .catch((err) => {
        clearTimeout(timer);
        setSlow(false);
        setLastError(err);
        setStatus("error");
      });
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cleanup = check();
    return cleanup;
  }, []);

  if (status === "ok") return null;
  if (status === "pending" && !slow) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {status === "error"
          ? friendlyMessage(mapApiError(lastError))
          : WAKE_UP_MESSAGE}
      </Text>
      {status === "error" ? (
        <Pressable onPress={check} style={styles.button}>
          <Text style={styles.buttonText}>{TRY_AGAIN_LABEL}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.board,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.input,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontFamily: Fonts.bodyHeavy,
    fontSize: 13,
    color: Colors.white,
  },
});
