import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

export default function EmBreve({ title, icon }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <Feather name={icon} size={32} color={colors.textMuted} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>Esta tela ainda será construída.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
});
