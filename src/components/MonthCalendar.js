import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import { DIAS_SEMANA_CURTOS, getMonthLabel, getMonthWeeks, toIsoDate } from "../utils/calendar";
import Card from "./Card";

export default function MonthCalendar({
  ano,
  mes,
  onMesAnterior,
  onProximoMes,
  diasDestacados = [],
  onDiaPress,
}) {
  const semanas = getMonthWeeks(ano, mes);

  return (
    <Card style={styles.card}>
      <View style={styles.cabecalho}>
        <Pressable onPress={onMesAnterior} hitSlop={8}>
          <Text style={styles.seta}>‹</Text>
        </Pressable>
        <Text style={styles.mesLabel}>{getMonthLabel(ano, mes)}</Text>
        <Pressable onPress={onProximoMes} hitSlop={8}>
          <Text style={styles.seta}>›</Text>
        </Pressable>
      </View>

      <View style={styles.semana}>
        {DIAS_SEMANA_CURTOS.map((dia) => (
          <Text key={dia} style={styles.diaSemana}>
            {dia}
          </Text>
        ))}
      </View>

      {semanas.map((semana, indice) => (
        <View key={indice} style={styles.semana}>
          {semana.map(({ data, noMesAtual }) => {
            const iso = toIsoDate(data);
            const destacado = diasDestacados.includes(iso);
            const Wrapper = onDiaPress ? Pressable : View;

            return (
              <Wrapper
                key={iso}
                style={[styles.dia, destacado && styles.diaDestacado]}
                onPress={onDiaPress ? () => onDiaPress(iso) : undefined}
              >
                <Text
                  style={[
                    styles.diaTexto,
                    !noMesAtual && styles.diaTextoFora,
                    destacado && styles.diaTextoDestacado,
                  ]}
                >
                  {data.getDate()}
                </Text>
              </Wrapper>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seta: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 6,
  },
  mesLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  semana: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  diaSemana: {
    width: 36,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: colors.textMuted,
  },
  dia: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  diaDestacado: {
    backgroundColor: colors.primary,
  },
  diaTexto: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.text,
  },
  diaTextoFora: {
    color: colors.textFaint,
  },
  diaTextoDestacado: {
    fontFamily: fonts.semibold,
    color: "#FFFFFF",
  },
});
