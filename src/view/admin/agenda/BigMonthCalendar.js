import { Feather } from "@expo/vector-icons";
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
  contagemPorDia = {}, // { "2026-11-06": 2, ... } — quantidade de eventos por dia
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
              const quantidade = contagemPorDia[iso] ?? 0;
              const temEvento = quantidade > 0;
              const hoje = iso === hojeIso;

              return (
                <Pressable
                  key={iso}
                  style={[
                    styles.dia,
                    temEvento && styles.diaComEvento,
                    temEvento && !noMesAtual && styles.diaComEventoFora,
                  ]}
                  onPress={() => onDiaPress(iso)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    temEvento
                      ? `Dia ${data.getDate()}, ${quantidade} ${quantidade === 1 ? "evento" : "eventos"}`
                      : `Ver eventos do dia ${data.getDate()}`
                  }
                >
                  <View style={[styles.diaMiolo, hoje && styles.diaHoje]}>
                    <Text
                      style={[
                        styles.diaTexto,
                        !noMesAtual && styles.diaTextoFora,
                        temEvento && styles.diaTextoComEvento,
                        hoje && styles.diaTextoHoje,
                      ]}
                    >
                      {data.getDate()}
                    </Text>
                  </View>
                  {temEvento ? (
                    <View style={styles.selo}>
                      <Feather name="calendar" size={10} color={colors.background} />
                      <Text style={styles.seloTexto}>{quantidade}</Text>
                    </View>
                  ) : null}
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
    alignItems: "center",
    paddingTop: 6,
    gap: 6,
    borderColor: colors.border,
    borderWidth: 0.5,
  },
  // Dia com evento: célula inteira tingida, para ser achada no meio da grade.
  diaComEvento: {
    backgroundColor: colors.primarySoft,
  },
  diaComEventoFora: {
    opacity: 0.6,
  },
  diaMiolo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  // Hoje: círculo cheio, para não se confundir com a célula tingida.
  diaHoje: {
    backgroundColor: colors.primary,
  },
  diaTexto: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  diaTextoFora: {
    color: colors.textFaint,
  },
  diaTextoComEvento: {
    fontFamily: fonts.bold,
  },
  diaTextoHoje: {
    fontFamily: fonts.bold,
    color: colors.background,
  },
  selo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  seloTexto: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.background,
  },
});
