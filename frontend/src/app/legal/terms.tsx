import { router } from "expo-router";

import { LegalScreen } from "@/components/LegalScreen";

const SECTIONS = [
  { title: "1. Acceptance", body: "By using Level-Up you agree to these terms. If you do not agree, please do not use the app." },
  { title: "2. Accounts", body: "You are responsible for keeping your username and password secure. Notify us of any unauthorized use." },
  { title: "3. Content", body: "Lessons and resources are provided by teachers. We do not guarantee accuracy of third-party content." },
  { title: "4. Termination", body: "We may suspend or terminate accounts that violate these terms." },
];

export default function TermsScreen() {
  return (
    <LegalScreen
      title="Terms of Service"
      lastUpdated="2026-10-29"
      sections={SECTIONS}
      onBack={() => router.back()}
    />
  );
}
