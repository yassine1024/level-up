import { useFonts } from "expo-font";
import {
  Fredoka_600SemiBold,
} from "@expo-google-fonts/fredoka";
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
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
    Fredoka_600SemiBold,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
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
            {/* Phase 0: auth / account / legal flows (no swipe-back) */}
            <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
            <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
            <Stack.Screen name="forgot-password" options={{ gestureEnabled: false }} />
            <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
            <Stack.Screen name="session-expired" options={{ gestureEnabled: false }} />
            <Stack.Screen name="legal/terms" options={{ gestureEnabled: true }} />
            <Stack.Screen name="legal/privacy" options={{ gestureEnabled: true }} />
            <Stack.Screen name="profile/delete-account" options={{ gestureEnabled: false }} />
            {/* Phase 0: teacher management */}
            <Stack.Screen name="teacher/profile" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/students" options={{ gestureEnabled: true }} />
            <Stack.Screen name="teacher/edit-resource" options={{ gestureEnabled: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
