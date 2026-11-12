import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EventCard from "../../../components/EventCard";
import ScreenHeader from "../../../components/ScreenHeader";
import { colors, fonts, spacing } from "../../../theme";
import {
  formatFullDate,
  formatShortDate,
  getWeekdayLabel,
  parseIsoDate,
  toIsoDate,
} from "../../../utils/calendar";
import { EVENTOS_EXEMPLO, STATUS_EVENTO_EXEMPLO } from "./eventosExemplo";

export default function AgendaDiaScreen({ navigation, route }) {
  const { data: diaIso } = route.params;
  const dia = parseIsoDate(diaIso);

  const eventosDoDia = EVENTOS_EXEMPLO.filter(
    (evento) => toIsoDate(evento.data) === diaIso,
  );

  function abrirEvento(evento) {
    navigation.navigate("ConfirmarPresenca", {
      evento: {
        id: evento.id,
        titulo: evento.titulo,
        data: toIsoDate(evento.data),
        horario: evento.horario,
        local: evento.local,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={formatFullDate(dia)}
          lead={getWeekdayLabel(dia)}
          onBack={() => navigation.goBack()}
        />

        {eventosDoDia.length ? (
          <View style={styles.lista}>
            {eventosDoDia.map((evento) => {
              const [diaNumero, mesAbrev] = formatShortDate(evento.data).split(" ");
              return (
                <EventCard
                  key={evento.id}
                  dia={diaNumero}
                  mes={mesAbrev}
                  titulo={evento.titulo}
                  horario={evento.horario}
                  local={evento.local}
                  statusLabel={STATUS_EVENTO_EXEMPLO[evento.status]?.label}
                  statusTone={STATUS_EVENTO_EXEMPLO[evento.status]?.tone}
                  onPress={() => abrirEvento(evento)}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Feather name="calendar" size={22} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>Nenhum evento neste dia.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 32,
    gap: 16,
  },
  lista: {
    gap: 12,
  },
  vazio: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  vazioTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
});
