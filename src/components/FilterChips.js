import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { colors, fonts, radius } from "../theme";

// Linha de filtros em formato de "chip" (ex.: Todos / Próximos / Encerrados).
// `opcoes` é uma lista de { key, label }; só uma fica ativa por vez.
export default function FilterChips({ opcoes, valor, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.linha, style]}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.key === valor;
        return (
          <Pressable
            key={opcao.key}
            onPress={() => onChange(opcao.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[styles.chip, ativo && styles.chipAtivo]}
          >
            <Text style={[styles.label, ativo && styles.labelAtivo]}>
              {opcao.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  chipAtivo: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  labelAtivo: {
    color: colors.primary,
  },
});
