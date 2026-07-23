import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./navigation/RootNavigator";
import { AppProvider } from "./store/AppContent";
import { AuthProvider } from "./store/AuthContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <RootNavigator />
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}