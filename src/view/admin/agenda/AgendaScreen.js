import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  const contagemPorDia = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(porDia).map(([iso, lista]) => [iso, lista.length]),
      ),
    [porDia],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.lead}>Toque em um dia para ver os eventos.</Text>
      </View>

      <View style={styles.calendario}>
        <BigMonthCalendar
          ano={ano}
          mes={mes}
          onMesAnterior={mesAnterior}
          onProximoMes={proximoMes}
          contagemPorDia={contagemPorDia}
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
  calendario: {
    flex: 1,
    padding: spacing.screen,
  },
});
