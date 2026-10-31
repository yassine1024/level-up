import { router } from "expo-router";

import { LegalScreen } from "@/components/LegalScreen";

const SECTIONS = [
  { title: "1. Data we collect", body: "We collect your username, role, and learning progress to provide the service." },
  { title: "2. How we use it", body: "Data is used to personalize lessons and track progress. We do not sell your data." },
  { title: "3. Storage", body: "Data is stored securely on our servers. You may request deletion at any time." },
  { title: "4. Contact", body: "Questions about privacy? Contact support." },
];

export default function PrivacyScreen() {
  return (
    <LegalScreen
      title="Privacy Policy"
      lastUpdated="2026-10-29"
      sections={SECTIONS}
      onBack={() => router.back()}
    />
  );
}
