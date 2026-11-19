import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EventCard from "../../../components/EventCard";
import ScreenHeader from "../../../components/ScreenHeader";
import { colors, fonts, spacing } from "../../../theme";
import {
  formatFullDate,
  getWeekdayLabel,
  parseIsoDate,
} from "../../../utils/calendar";
import { useBrigadistaDados } from "../useBrigadistaDados";

const STATUS_EVENTO = {
  confirmado: { label: "Confirmada", tone: "success" },
  pendente: { label: "Aguardando", tone: "warning" },
  disponivel: { label: "Disponível", tone: "primary" },
  recusado: { label: "Indisponível", tone: "neutral" },
};

export default function AgendaDiaScreen({ navigation, route }) {
  const { data: diaIso } = route.params;
  const { compromissosDoMes } = useBrigadistaDados();
  const dia = parseIsoDate(diaIso);

  const eventosDoDia = compromissosDoMes(
    dia.getFullYear(),
    dia.getMonth(),
  ).filter((evento) => evento.dataIso === diaIso);

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
              const statusInfo =
                STATUS_EVENTO[evento.status] ?? STATUS_EVENTO.disponivel;
              return (
                <EventCard
                  key={evento.id}
                  dia={evento.dia}
                  mes={evento.mes}
                  titulo={evento.titulo}
                  horario={evento.horario}
                  local={evento.local}
                  statusLabel={statusInfo.label}
                  statusTone={statusInfo.tone}
                  onPress={() =>
                    navigation.navigate("ConfirmarPresenca", {
                      evento: {
                        id: evento.id,
                        eventoId: evento.eventoId,
                        titulo: evento.titulo,
                        descricao: evento.descricao,
                        data: evento.dataIso,
                        horario: evento.horario,
                        local: evento.local,
                        certificacoes: evento.certificacoes,
                      },
                    })
                  }
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Feather name="calendar" size={22} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>Nenhum compromisso neste dia.</Text>
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
    gap: 10,
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
