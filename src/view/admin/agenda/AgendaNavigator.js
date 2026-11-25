import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EventoFormScreen from "../eventos/EventoFormScreen";
import RecorrenciaScreen from "../eventos/RecorrenciaScreen";
import AgendaDiaScreen from "./AgendaDiaScreen";
import AgendaScreen from "./AgendaScreen";
import EscalaEventoScreen from "./EscalaEventoScreen";

const Stack = createNativeStackNavigator();

export default function AgendaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaInicio" component={AgendaScreen} />
      <Stack.Screen name="AgendaDia" component={AgendaDiaScreen} />
      <Stack.Screen name="EscalaEvento" component={EscalaEventoScreen} />
      {/* O formulário de evento também fica nesta pilha: assim o "Cancelar"
          e o "voltar" retornam para a tela da agenda que abriu o formulário. */}
      <Stack.Screen name="EventoForm" component={EventoFormScreen} />
      <Stack.Screen name="Recorrencia" component={RecorrenciaScreen} />
    </Stack.Navigator>
  );
}
