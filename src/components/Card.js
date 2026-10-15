import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

export default function Card({ tinted = false, style, children }) {
  return <View style={[styles.card, tinted && styles.tinted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  tinted: {
    backgroundColor: colors.primaryTint,
  },
});
