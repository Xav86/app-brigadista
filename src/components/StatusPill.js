import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

const TONES = {
  success: { bg: colors.successSoft, fg: colors.success },
  primary: { bg: colors.primarySoft, fg: colors.primary },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  neutral: { bg: colors.neutralSoft, fg: colors.textMuted },
};

export default function StatusPill({ label, tone = 'success' }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
});
