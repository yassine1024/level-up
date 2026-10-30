import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "@/components/useColorScheme";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  anchor: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            {/* Disable iOS swipe-back where the flow has its own controls */}
            <Stack.Screen name="lesson/loading" options={{ gestureEnabled: false }} />
            <Stack.Screen name="lesson/slides" options={{ gestureEnabled: false }} />
            <Stack.Screen name="lesson/grammar" options={{ gestureEnabled: false }} />
            <Stack.Screen name="lesson/complete" options={{ gestureEnabled: false }} />
            <Stack.Screen name="practice/character" options={{ gestureEnabled: false }} />
            {/* Phase 7: register all new routes */}
            <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
            <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
            <Stack.Screen name="forgot-password" options={{ gestureEnabled: false }} />
            <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
            <Stack.Screen name="session-expired" options={{ gestureEnabled: false }} />
            <Stack.Screen name="legal/terms" options={{ gestureEnabled: true }} />
            <Stack.Screen name="legal/privacy" options={{ gestureEnabled: true }} />
            <Stack.Screen name="profile/delete-account" options={{ gestureEnabled: false }} />
            <Stack.Screen name="teacher/profile" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/students" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/edit-resource" options={{ gestureEnabled: false }} />
            <Stack.Screen name="practice/character-settings" options={{ gestureEnabled: true }} />
            {/* Missing pages (old UI) */}
            <Stack.Screen name="check-inbox" options={{ gestureEnabled: true }} />
            <Stack.Screen name="settings" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/settings" options={{ gestureEnabled: true }} />
            <Stack.Screen name="legal/index" options={{ gestureEnabled: true }} />
            <Stack.Screen name="maintenance" options={{ gestureEnabled: false }} />
            <Stack.Screen name="offline" options={{ gestureEnabled: true }} />
            <Stack.Screen name="server-error" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/home" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/lesson-detail" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/lesson-preview" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/curriculum" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/upload-error" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/classes" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/class-detail" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/student-progress" options={{ gestureEnabled: true }} />
            <Stack.Screen name="join" options={{ gestureEnabled: false }} />
            <Stack.Screen name="class-joined" options={{ gestureEnabled: false }} />
            <Stack.Screen name="course/unit-detail" options={{ gestureEnabled: true }} />
            <Stack.Screen name="course/locked-unit" options={{ gestureEnabled: true }} />
            <Stack.Screen name="course/finished-units" options={{ gestureEnabled: true }} />
            <Stack.Screen name="lesson/review" options={{ gestureEnabled: true }} />
            <Stack.Screen name="level-completed" options={{ gestureEnabled: false }} />
            <Stack.Screen name="lesson/not-ready" options={{ gestureEnabled: true }} />
            <Stack.Screen name="lesson/slides-failed" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/pick-lesson" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/word-match" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/speaking-soon" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/listening-result" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/listening-player" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/mistake-detail" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/episode-summary" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/episode-history" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/no-episode" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/leave-chat" options={{ gestureEnabled: true }} />
            <Stack.Screen name="practice/chat-error" options={{ gestureEnabled: true }} />
            <Stack.Screen name="placement-leave" options={{ gestureEnabled: true }} />
            <Stack.Screen name="placement-resume" options={{ gestureEnabled: true }} />
            <Stack.Screen name="placement-beginner" options={{ gestureEnabled: true }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
