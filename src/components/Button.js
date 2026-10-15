import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

const VARIANTS = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: '#FFFFFF', border: colors.primary },
  outline: { bg: colors.background, pressed: colors.primaryTint, fg: colors.primary, border: colors.primary },
  soft: { bg: colors.primaryTint, pressed: colors.primarySoft, fg: colors.primary, border: colors.primaryTint },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  leftIcon,
  leftIconFamily: LeftIconFamily = Feather,
  rightIcon,
  loading = false,
  disabled = false,
  style,
}) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.side}>
        {leftIcon ? <LeftIconFamily name={leftIcon} size={20} color={v.fg} /> : null}
      </View>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.label, { color: v.fg }]} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={styles.side}>
        {rightIcon ? <Feather name={rightIcon} size={20} color={v.fg} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 24,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
});
