import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, spacing } from "../../../theme";
import { eventosPorDia } from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";
import BigMonthCalendar from "./BigMonthCalendar";
import { useAgendaMes } from "./useAgendaMes";

export default function AgendaScreen({ navigation }) {
  const { eventos } = useAdminDados();
  const { ano, mes, mesAnterior, proximoMes } = useAgendaMes();

  const porDia = useMemo(
    () => eventosPorDia(eventos, ano, mes),
    [eventos, ano, mes],
  );
  const diasComEvento = useMemo(() => Object.keys(porDia), [porDia]);

  // As telas de pedidos e de agendamento manual ficam na aba Início.
  function abrirNoInicio(tela) {
    navigation.getParent()?.navigate("Home", { screen: tela });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.lead}>Toque em um dia para ver os eventos.</Text>
      </View>

      <View style={styles.chips}>
        <View style={[styles.chip, styles.chipAtivo]}>
          <Text style={[styles.chipLabel, styles.chipLabelAtivo]}>Agenda</Text>
        </View>
        <Pressable
          style={styles.chip}
          onPress={() => abrirNoInicio("Solicitacoes")}
        >
          <Text style={styles.chipLabel}>Meus pedidos</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, styles.chipDestaque]}
          onPress={() => abrirNoInicio("AgendamentoManual")}
        >
          <Text style={[styles.chipLabel, styles.chipLabelAtivo]}>
            Agendamento manual
          </Text>
        </Pressable>
      </View>

      <View style={styles.calendario}>
        <BigMonthCalendar
          ano={ano}
          mes={mes}
          onMesAnterior={mesAnterior}
          onProximoMes={proximoMes}
          diasComEvento={diasComEvento}
          onDiaPress={(iso) => navigation.navigate("AgendaDia", { data: iso })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    gap: 6,
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.neutralSoft,
  },
  chipAtivo: {
    backgroundColor: colors.primarySoft,
  },
  chipDestaque: {
    backgroundColor: colors.primaryTint,
  },
  chipLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipLabelAtivo: {
    color: colors.primary,
  },
  calendario: {
    flex: 1,
    padding: spacing.screen,
  },
});
