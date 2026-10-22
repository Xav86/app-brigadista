import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import AgendaScreen from "./AgendaScreen";
import EventosScreen from "./EventosScreen";
import GestaoNavigator from "./gestao/GestaoNavigator";
import HomeScreen from "./HomeScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Eventos: "calendar",
  Gestao: "user",
};

export default function AdminNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} icons={ICONS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ title: "Agenda" }}
      />
      <Tab.Screen
        name="Eventos"
        component={EventosScreen}
        options={{ title: "Eventos" }}
      />
      <Tab.Screen name="Gestao" options={{ title: "Gestão" }}>
        {(props) => <GestaoNavigator {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
