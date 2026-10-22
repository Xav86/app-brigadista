import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AppTabBar from "../../components/AppTabBar";
import HomeScreen from "./HomeScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
};

export default function AdminNavigator() {
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
    </Tab.Navigator>
  );
}
