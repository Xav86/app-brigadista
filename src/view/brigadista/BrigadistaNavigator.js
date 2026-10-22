import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import HomeScreen from "./HomeScreen";
import AgendaNavigator from "./agenda/AgendaNavigator";
<<<<<<< HEAD
//import EscalasScreen from "./EscalasScreen";
import EscalasNavigator from "./escalas/EscalasNavigator";
//import PerfilScreen from "./PerfilScreen";
import PerfilNavigator from "./perfil/PerfilNavigator";
=======
import EscalasScreen from "./EscalasScreen";
import PerfilScreen from "./PerfilScreen";
>>>>>>> 733d4bb4fc3c654ca982f1614ea6e7cf2ed2feb3

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Agenda: "calendar",
  Escalas: "clipboard",
  Perfil: "user",
};

<<<<<<< HEAD
export default function BrigadistaNavigator({ onLogout }) {
=======
export default function BrigadistaNavigator() {
>>>>>>> 733d4bb4fc3c654ca982f1614ea6e7cf2ed2feb3
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
<<<<<<< HEAD
        //component={EscalasScreen}
        component={EscalasNavigator}
        options={{ title: "Escalas" }}
      />
      <Tab.Screen 
      name="Perfil" 
      options={{ title: "Perfil" }}>
        {() => <PerfilNavigator onLogout={onLogout} />}
      </Tab.Screen>
=======
        component={EscalasScreen}
        options={{ title: "Escalas" }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: "Perfil" }}
      />
>>>>>>> 733d4bb4fc3c654ca982f1614ea6e7cf2ed2feb3
    </Tab.Navigator>
  );
}
