import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius } from "../theme";

// Linha de filtros em formato de "chip" (ex.: Todos / Próximos / Encerrados).
// `opcoes` é uma lista de { key, label }; só uma fica ativa por vez.
// Com `wrap`, os chips quebram de linha em vez de rolar na horizontal
// (útil dentro de folhas/cartões com muitas opções).
export default function FilterChips({
  opcoes,
  valor,
  onChange,
  style,
  wrap = false,
}) {
  const chips = opcoes.map((opcao) => {
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
  });

  if (wrap) {
    return <View style={[styles.linha, styles.quebra, style]}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.linha, style]}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: {
    gap: 8,
  },
  quebra: {
    flexDirection: "row",
    flexWrap: "wrap",
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
