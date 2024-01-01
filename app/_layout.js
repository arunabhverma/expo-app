import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router/stack";
import { Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                animation:
                  Platform.OS === "android" ? "fade_from_bottom" : "default",
              }}
            />
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
