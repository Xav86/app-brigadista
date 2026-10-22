import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InicioScreen from "./InicioScreen";

const Stack = createNativeStackNavigator();

export default function InicioNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InicioAdmin" component={InicioScreen} />
    </Stack.Navigator>
  );
}
