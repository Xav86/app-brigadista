import { useEffect, useState } from "react";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from "./login/LoginScreen";
import BrigadistaNavigator from "./brigadista/BrigadistaNavigator";
import AdminNavigator from "./admin/AdminNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [role, setRole] = useState(null);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
<<<<<<< HEAD
        {role === "brigadista" && (
          <BrigadistaNavigator onLogout={() => setRole(null)} />
        )}
=======
        {role === "brigadista" && <BrigadistaNavigator />}
>>>>>>> 733d4bb4fc3c654ca982f1614ea6e7cf2ed2feb3
        {role === "admin" && <AdminNavigator />}
        {!role && <LoginScreen onLogin={setRole} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
