// desativado, se não tiver mais uso remover
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EscalasScreen from "../EscalasScreen";
import EscalaDetalhesScreen from "../agenda/EscalaDetalhesScreen";

const Stack = createNativeStackNavigator();

export default function EscalasNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscalasInicio" component={EscalasScreen} />
      <Stack.Screen name="EscalaDetalhes" component={EscalaDetalhesScreen} />
    </Stack.Navigator>
  );
}