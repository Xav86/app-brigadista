import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EventCard from "../../../components/EventCard";
import MonthCalendar from "../../../components/MonthCalendar";
import { useAgendaMonth } from "./useAgendaMonth";
import { colors, fonts, spacing } from "../../../theme";
import { formatShortDate, toIsoDate } from "../../../utils/calendar";

// Dados de exemplo enquanto não há backend/armazenamento local.
const EVENTOS = [
  {
    id: "1",
    data: new Date(2026, 9, 5),
    titulo: "Treinamento da Brigada",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "confirmado",
  },
  {
    id: "2",
    data: new Date(2026, 9, 12),
    titulo: "Treinamento prático",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "pendente",
  },
  {
    id: "3",
    data: new Date(2026, 9, 26),
    titulo: "Simulado de Emergência",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "confirmado",
  },
];

const STATUS = {
  confirmado: { label: "Confirmada", tone: "success" },
  pendente: { label: "Aguardando", tone: "warning" },
};

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

export default function AgendaScreen({ navigation }) {
  const { ano, mes, mesAnterior, proximoMes } = useAgendaMonth();

  const eventosDoMes = EVENTOS.filter(
    (evento) => evento.data.getFullYear() === ano && evento.data.getMonth() === mes
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Minha agenda</Text>
          <Text style={styles.lead}>Visualize seus compromissos e escalas.</Text>
        </View>

        <View style={styles.chips}>
          <View style={[styles.chip, styles.chipAtivo]}>
            <Text style={[styles.chipLabel, styles.chipLabelAtivo]}>Agenda</Text>
          </View>
          <Pressable style={styles.chip} onPress={emBreve}>
            <Text style={styles.chipLabel}>Meus pedidos</Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={() => navigation.navigate("SolicitarDisponibilidade")}
          >
            <Text style={styles.chipLabel}>Solicitar disponibilidade</Text>
          </Pressable>
        </View>

        <MonthCalendar
          ano={ano}
          mes={mes}
          onMesAnterior={mesAnterior}
          onProximoMes={proximoMes}
          diasDestacados={eventosDoMes.map((evento) => toIsoDate(evento.data))}
        />

        <View style={styles.compromissos}>
          <View style={styles.compromissosHeader}>
            <Text style={styles.sectionTitle}>Próximos compromissos</Text>
            <Pressable onPress={emBreve} hitSlop={8}>
              <Text style={styles.link}>Ver todos</Text>
            </Pressable>
          </View>

          {eventosDoMes.length ? (
            eventosDoMes.map((evento) => (
              <EventCard
                key={evento.id}
                dia={formatShortDate(evento.data).split(" ")[0]}
                mes={formatShortDate(evento.data).split(" ")[1]}
                titulo={evento.titulo}
                horario={evento.horario}
                local={evento.local}
                statusLabel={STATUS[evento.status].label}
                statusTone={STATUS[evento.status].tone}
                onPress={() =>
                  navigation.navigate("ConfirmarPresenca", {
                    evento: {
                      id: evento.id,
                      titulo: evento.titulo,
                      data: toIsoDate(evento.data),
                      horario: evento.horario,
                      local: evento.local,
                    },
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.vazio}>Nenhum compromisso neste mês.</Text>
          )}
        </View>
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
    gap: 14,
  },
  header: {
    gap: 6,
    marginTop: 8,
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
  compromissos: {
    gap: 10,
  },
  compromissosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
});
