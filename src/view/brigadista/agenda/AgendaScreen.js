import { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BigMonthCalendar from "../../../components/BigMonthCalendar";
import { colors, fonts, spacing } from "../../../theme";
import { toIsoDate } from "../../../utils/calendar";
import { useAgendaMonth } from "./useAgendaMonth";
import { EVENTOS_EXEMPLO } from "./eventosExemplo";

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

export default function AgendaScreen({ navigation }) {
  const { ano, mes, mesAnterior, proximoMes } = useAgendaMonth();

  const contagemPorDia = useMemo(() => {
    const mapa = {};
    for (const evento of EVENTOS_EXEMPLO) {
      if (evento.data.getFullYear() !== ano || evento.data.getMonth() !== mes)
        continue;
      const iso = toIsoDate(evento.data);
      mapa[iso] = (mapa[iso] ?? 0) + 1;
    }
    return mapa;
  }, [ano, mes]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha agenda</Text>
        <Text style={styles.lead}>
          Toque em um dia para ver seus compromissos.
        </Text>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
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
