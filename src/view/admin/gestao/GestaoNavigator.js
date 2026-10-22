import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BrigadistasScreen from "./BrigadistasScreen";
import DetalhesBrigadistaScreen from "./DetalhesBrigadistaScreen";
import GestaoScreen from "./GestaoScreen";
import NovoBrigadistaScreen from "./NovoBrigadistaScreen";
import { BrigadistasProvider } from "./useBrigadistas";

const Stack = createNativeStackNavigator();

export default function GestaoNavigator({ onLogout }) {
  return (
    <BrigadistasProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GestaoInicio">
          {(props) => <GestaoScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="Brigadistas" component={BrigadistasScreen} />
        <Stack.Screen name="NovoBrigadista" component={NovoBrigadistaScreen} />
        <Stack.Screen
          name="DetalhesBrigadista"
          component={DetalhesBrigadistaScreen}
        />
      </Stack.Navigator>
    </BrigadistasProvider>
  );
}
