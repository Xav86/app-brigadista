import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import { formatFullDate, getWeekdayLabel } from "../utils/calendar";

// Linha de uma data em lista: ícone, "05 de outubro de 2026" e o dia da semana.
// Com `onRemove`, mostra um "x" para tirar a data da lista.
export default function DateListItem({
  data,
  icon = "calendar",
  titulo = formatFullDate(data),
  subtitulo = getWeekdayLabel(data),
  onRemove,
}) {
  return (
    <View style={styles.linha}>
      <View style={styles.icone}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${titulo}`}
        >
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icone: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  subtitulo: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
