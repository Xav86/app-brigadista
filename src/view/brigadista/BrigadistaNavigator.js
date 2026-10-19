import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import HomeScreen from "./HomeScreen";
import AgendaScreen from "./AgendaScreen";
import EscalasScreen from "./EscalasScreen";
import PerfilScreen from "./PerfilScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Escalas: "clipboard",
  Perfil: "user",
};

export default function BrigadistaNavigator() {
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
        name="Escalas"
        component={EscalasScreen}
        options={{ title: "Escalas" }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
