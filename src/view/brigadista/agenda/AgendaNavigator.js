import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AgendaScreen from "./AgendaScreen";
import ConfirmarDisponibilidadeScreen from "./ConfirmarDisponibilidadeScreen";
import ConfirmarPresencaScreen from "./ConfirmarPresencaScreen";
import DisponibilidadeEnviadaScreen from "./DisponibilidadeEnviadaScreen";
import PedidoEnviadoScreen from "./PedidoEnviadoScreen";
import SolicitarDisponibilidadeScreen from "./SolicitarDisponibilidadeScreen";

const Stack = createNativeStackNavigator();

export default function AgendaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaInicio" component={AgendaScreen} />
      <Stack.Screen name="ConfirmarPresenca" component={ConfirmarPresencaScreen} />
      <Stack.Screen name="PedidoEnviado" component={PedidoEnviadoScreen} />
      <Stack.Screen
        name="SolicitarDisponibilidade"
        component={SolicitarDisponibilidadeScreen}
      />
      <Stack.Screen
        name="ConfirmarDisponibilidade"
        component={ConfirmarDisponibilidadeScreen}
      />
      <Stack.Screen
        name="DisponibilidadeEnviada"
        component={DisponibilidadeEnviadaScreen}
      />
    </Stack.Navigator>
  );
}
