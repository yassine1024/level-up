import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Colors, Fonts, Radii } from "@/constants/theme";

const CORRECT_CODE = "123456";

type Status = "idle" | "success" | "error";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ next?: string }>();
  const next = (params.next as string) || "/home";
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [resending, setResending] = useState(false);

  const handleVerify = () => {
    if (code.trim() === CORRECT_CODE) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => setResending(false), 1200);
  };

  if (status === "success") {
    return (
      <AuthLayout title="Email verified" showBack={false}>
        <View style={styles.center}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>
            Your email has been verified. You can now continue.
          </Text>
          <View style={{ width: "100%", marginTop: 16 }}>
            <Button title="Continue" onPress={() => router.replace(next as any)} />
          </View>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email. (Demo code: 123456)">
      <View style={styles.codeWrap}>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => {
            setCode(t.replace(/\D/g, "").slice(0, 6));
            setStatus("idle");
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={Colors.placeholder}
        />
      </View>
      {status === "error" ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            That code is not correct. Try again or resend.
          </Text>
        </View>
      ) : null}
      <Button
        title="Verify"
        disabled={code.length !== 6}
        onPress={handleVerify}
      />
      <Text style={styles.resend}>
        No code?{" "}
        <Text style={styles.link} onPress={() => router.replace(next as any)}>
          Continue without code
        </Text>
      </Text>
      <Text style={styles.resend}>
        Didn&apos;t get it?{" "}
        <Text style={styles.link} onPress={handleResend}>
          {resending ? "Sending..." : "Resend code"}
        </Text>
      </Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12 },
  successIcon: {
    fontSize: 48,
    color: Colors.primary,
    fontFamily: Fonts.heading,
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.muted,
    textAlign: "center",
  },
  codeWrap: { width: "100%" },
  codeInput: {
    height: 56,
    borderRadius: Radii.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    textAlign: "center",
    fontFamily: Fonts.bodyHeavy,
    fontSize: 24,
    letterSpacing: 8,
    color: Colors.text,
  },
  errorCard: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.errorBorder,
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.errorText,
  },
  resend: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
    marginTop: 8,
  },
  link: {
    color: Colors.primaryDark,
    fontFamily: Fonts.bodyHeavy,
  },
});
