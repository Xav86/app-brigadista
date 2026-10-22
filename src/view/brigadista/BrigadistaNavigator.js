import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import HomeScreen from "./HomeScreen";
import AgendaNavigator from "./agenda/AgendaNavigator";
//import EscalasScreen from "./EscalasScreen";
import EscalasNavigator from "./escalas/EscalasNavigator";
//import PerfilScreen from "./PerfilScreen";
import PerfilNavigator from "./perfil/PerfilNavigator";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Escalas: "clipboard",
  Perfil: "user",
};

export default function BrigadistaNavigator({ onLogout }) {
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
        component={AgendaNavigator}
        options={{ title: "Agenda" }}
      />
      <Tab.Screen
        name="Escalas"
        //component={EscalasScreen}
        component={EscalasNavigator}
        options={{ title: "Escalas" }}
      />
      <Tab.Screen 
      name="Perfil" 
      options={{ title: "Perfil" }}>
        {() => <PerfilNavigator onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
