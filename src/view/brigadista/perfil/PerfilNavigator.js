import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PerfilScreen from "../PerfilScreen";
import NotificacoesScreen from "./NotificacoesScreen";
import InformacoesPessoaisScreen from "../../perfil/InformacoesPessoaisScreen";

const Stack = createNativeStackNavigator();

export default function PerfilNavigator({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilInicio">
        {(props) => <PerfilScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="InformacoesPessoais"
        component={InformacoesPessoaisScreen}
      />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
    </Stack.Navigator>
  );
}
