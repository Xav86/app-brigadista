import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../../theme";
import {
  DIAS_SEMANA_CURTOS,
  getMonthLabel,
  getMonthWeeks,
  toIsoDate,
} from "../../../utils/calendar";

// Calendário de mês pensado para ocupar a tela inteira: células grandes, sem
// lista embaixo. Usado só na Agenda do admin — o MonthCalendar (compacto, em
// src/components) continua servindo as outras telas que empilham calendário + conteúdo.
export default function BigMonthCalendar({
  ano,
  mes,
  onMesAnterior,
  onProximoMes,
  diasComEvento = [],
  onDiaPress,
}) {
  const semanas = getMonthWeeks(ano, mes);
  const hojeIso = toIsoDate(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Pressable onPress={onMesAnterior} hitSlop={10} style={styles.seta}>
          <Text style={styles.setaTexto}>‹</Text>
        </Pressable>
        <Text style={styles.mesLabel}>{getMonthLabel(ano, mes)}</Text>
        <Pressable onPress={onProximoMes} hitSlop={10} style={styles.seta}>
          <Text style={styles.setaTexto}>›</Text>
        </Pressable>
      </View>

      <View style={styles.semanaLabels}>
        {DIAS_SEMANA_CURTOS.map((dia) => (
          <Text key={dia} style={styles.diaSemanaLabel}>
            {dia}
          </Text>
        ))}
      </View>

      <View style={styles.grade}>
        {semanas.map((semana, indice) => (
          <View key={indice} style={styles.semana}>
            {semana.map(({ data, noMesAtual }) => {
              const iso = toIsoDate(data);
              const temEvento = diasComEvento.includes(iso);
              const hoje = iso === hojeIso;

              return (
                <Pressable
                  key={iso}
                  style={styles.dia}
                  onPress={() => onDiaPress(iso)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver eventos do dia ${data.getDate()}`}
                >
                  <View style={[styles.diaMiolo, hoje && styles.diaHoje]}>
                    <Text
                      style={[
                        styles.diaTexto,
                        !noMesAtual && styles.diaTextoFora,
                        hoje && styles.diaTextoHoje,
                      ]}
                    >
                      {data.getDate()}
                    </Text>
                    {temEvento ? <View style={styles.ponto} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seta: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  setaTexto: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.textMuted,
  },
  mesLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textTransform: "capitalize",
  },
  semanaLabels: {
    flexDirection: "row",
  },
  diaSemanaLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  grade: {
    flex: 1,
  },
  semana: {
    flex: 1,
    flexDirection: "row",
  },
  dia: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: .5,
  },
  diaMiolo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  diaHoje: {
    backgroundColor: colors.primarySoft,
  },
  diaTexto: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  diaTextoFora: {
    color: colors.textFaint,
  },
  diaTextoHoje: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  ponto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
