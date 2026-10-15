import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../../theme';

const ICONS = {
  index: 'home',
  agenda: 'calendar',
  escalas: 'clipboard',
  perfil: 'user',
};

function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const color = focused ? colors.primary : colors.textMuted;

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            style={[styles.item, focused && styles.itemActive]}
          >
            <Feather name={ICONS[route.name]} size={20} color={color} />
            <Text style={[styles.label, { color, fontFamily: focused ? fonts.semibold : fonts.regular }]}>
              {options.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BrigadistaLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="escalas" options={{ title: 'Escalas' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: {
    width: 72,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemActive: {
    backgroundColor: colors.primaryTint,
  },
  label: {
    fontSize: 11,
  },
});
