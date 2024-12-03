import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthStore } from "@/globalUserStorage";

export default function RootLayout() {
  const router = useRouter();
  const { isLoggedIn, initialized } = AuthStore.useState((state) => ({
    isLoggedIn: state.isLoggedIn,
    initialized: state.initialized,
  }));

  useEffect(() => {
    if (!initialized) return; // wait until this is  initialized
    
    if (!isLoggedIn) {
      router.replace("/auth/SigninforWhat2Wear");
    } else {
      router.replace("/(tabs)");
    }
  }, [initialized, isLoggedIn]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}
