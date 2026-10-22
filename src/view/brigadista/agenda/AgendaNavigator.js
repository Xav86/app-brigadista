import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AgendaScreen from "./AgendaScreen";
import ConfirmarPresencaScreen from "./ConfirmarPresencaScreen";
import PedidoEnviadoScreen from "./PedidoEnviadoScreen";

const Stack = createNativeStackNavigator();

export default function AgendaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaInicio" component={AgendaScreen} />
      <Stack.Screen name="ConfirmarPresenca" component={ConfirmarPresencaScreen} />
      <Stack.Screen name="PedidoEnviado" component={PedidoEnviadoScreen} />
    </Stack.Navigator>
  );
}
