import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EventoFormScreen from "./EventoFormScreen";
import EventosScreen from "./EventosScreen";
import RecorrenciaScreen from "./RecorrenciaScreen";

const Stack = createNativeStackNavigator();

export default function EventosNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventosLista" component={EventosScreen} />
      <Stack.Screen
        name="EventoForm"
        component={EventoFormScreen}
        // Um formulário por evento: abrir outro evento não reaproveita o estado do anterior.
        getId={({ params }) => params?.eventoId ?? "novo"}
      />
      <Stack.Screen name="Recorrencia" component={RecorrenciaScreen} />
    </Stack.Navigator>
  );
}
