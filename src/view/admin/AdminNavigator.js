import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import AgendaScreen from "./AgendaScreen";
import EventosNavigator from "./eventos/EventosNavigator";
import GestaoNavigator from "./gestao/GestaoNavigator";
import InicioNavigator from "./inicio/InicioNavigator";
import { AdminDadosProvider } from "./useAdminDados";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Eventos: "calendar",
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
          component={AgendaScreen}
          options={{ title: "Agenda" }}
        />
        <Tab.Screen
          name="Eventos"
          component={EventosNavigator}
          options={{ title: "Eventos" }}
        />
        <Tab.Screen name="Gestao" options={{ title: "Gestão" }}>
          {(props) => <GestaoNavigator {...props} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </AdminDadosProvider>
  );
}
