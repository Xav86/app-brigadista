
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './login/LoginScreen';
import HomeScreen from './brigadista/HomeScreen';
import PerfilScreen from './brigadista/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      {loggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
          />
          <Tab.Screen
            name="Perfil"
            component={PerfilScreen}
          />
        </Tab.Navigator>
      ) : (
        <LoginScreen
          onLogin={() => setLoggedIn(true)}
        />
      )}
    </NavigationContainer>
  );
}
