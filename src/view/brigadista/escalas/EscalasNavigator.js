import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EscalasScreen from "../EscalasScreen";
import EscalaDetalhesScreen from "./EscalaDetalhesScreen";

const Stack = createNativeStackNavigator();

export default function EscalasNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscalasInicio" component={EscalasScreen} />
      <Stack.Screen name="EscalaDetalhes" component={EscalaDetalhesScreen} />
    </Stack.Navigator>
  );
}