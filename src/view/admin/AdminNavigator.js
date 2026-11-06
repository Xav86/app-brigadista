import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import AgendaNavigator from "./agenda/AgendaNavigator";
import EventosNavigator from "./eventos/EventosNavigator";
import GestaoNavigator from "./gestao/GestaoNavigator";
import InicioNavigator from "./inicio/InicioNavigator";
import SolicitacoesScreen from "./inicio/SolicitacoesScreen";
import { AdminDadosProvider } from "./useAdminDados";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Solicitacoes: "inbox",
  Gestao: "user",
};

export default function AdminNavigator({ onLogout }) {
  return (
    <AdminDadosProvider>
      <Tab.Navigator
        tabBar={(props) => <AppTabBar {...props} icons={ICONS} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Home"
          component={InicioNavigator}
          options={{ title: "Início" }}
        />
        <Tab.Screen
          name="Agenda"
          component={AgendaNavigator}
          options={{ title: "Agenda" }}
        />
        <Tab.Screen
          name="Solicitacoes"
          component={SolicitacoesScreen}
          options={{ title: "Solicitações" }}
        />
        <Tab.Screen name="Gestao" options={{ title: "Gestão" }}>
          {(props) => <GestaoNavigator {...props} onLogout={onLogout} />}
        </Tab.Screen>
        {/* Sem botão na barra: continua registrada porque Início, Agenda e Gestão
            navegam até a lista e o formulário de eventos por aqui. */}
        <Tab.Screen
          name="Eventos"
          component={EventosNavigator}
          options={{ title: "Eventos", tabBarItemStyle: { display: "none" } }}
        />
      </Tab.Navigator>
    </AdminDadosProvider>
  );
}
