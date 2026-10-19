import { Feather } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, fonts, radius } from "../theme";

const TextField = forwardRef(function TextField(
  { icon, secure = false, error, style, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  const borderColor = error
    ? colors.primary
    : focused
      ? colors.text
      : colors.border;

  return (
    <View style={style}>
      <View style={[styles.box, { borderColor }]}>
        {icon ? (
          <Feather name={icon} size={20} color={colors.textMuted} />
        ) : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
          >
            <Feather
              name={hidden ? "eye" : "eye-off"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  box: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
});
