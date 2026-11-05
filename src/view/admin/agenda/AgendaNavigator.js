import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AgendaDiaScreen from "./AgendaDiaScreen";
import AgendaScreen from "./AgendaScreen";

const Stack = createNativeStackNavigator();

export default function AgendaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaInicio" component={AgendaScreen} />
      <Stack.Screen name="AgendaDia" component={AgendaDiaScreen} />
    </Stack.Navigator>
  );
}
