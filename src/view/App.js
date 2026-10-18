import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './login/LoginScreen';
import HomeScreen from './brigadista/HomeScreen';
import AgendaScreen from './brigadista/AgendaScreen';
import EscalasScreen from './brigadista/EscalasScreen';
import PerfilScreen from './brigadista/PerfilScreen';

import BrigadistaTabBar from '../components/BrigadistaTabBar';

const Tab = createBottomTabNavigator();

function BrigadistaNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BrigadistaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início' }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ title: 'Agenda' }}
      />
      <Tab.Screen
        name="Escalas"
        component={EscalasScreen}
        options={{ title: 'Escalas' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {loggedIn ? (
          <BrigadistaNavigator />
        ) : (
          <LoginScreen onLogin={() => setLoggedIn(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}