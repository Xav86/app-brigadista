import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import { formatFullDate, getWeekdayLabel, parseIsoDate } from "../../../utils/calendar";
import {
  descreverEquipe,
  equipeIncompleta,
  eventosPorDia,
  formatarHorario,
} from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";

const STATUS_ESCALA = {
  confirmado: { label: "Confirmado", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  proposto: { label: "Proposto", tone: "neutral" },
};

function minutosDoDia(data) {
  return data.getHours() * 60 + data.getMinutes();
}

function EventoDoDia({ evento, escalas, onPress }) {
  const incompleta = equipeIncompleta(escalas.length, evento);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.eventoCard, pressed && styles.eventoCardPressed]}>
          <View style={styles.eventoTopo}>
            <View style={styles.eventoHorario}>
              <Feather name="clock" size={13} color={colors.primary} />
              <Text style={styles.eventoHorarioTexto} numberOfLines={1}>
                {formatarHorario(evento)}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.eventoTitulo}>{evento.nome}</Text>
              <Text style={styles.eventoLocal} numberOfLines={1}>
                {evento.local}
              </Text>
              <Text
                style={[styles.eventoEquipe, incompleta && styles.equipeAlerta]}
              >
                Equipe: {descreverEquipe(escalas.length, evento)}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </View>

          {escalas.length ? (
            <View style={styles.escalados}>
              {escalas.map((escala) => (
                <View key={escala.id} style={styles.escalado}>
                  <Feather name="user" size={13} color={colors.textMuted} />
                  <Text style={styles.escaladoNome} numberOfLines={1}>
                    {escala.brigadistaNome}
                  </Text>
                  <StatusPill
                    label={STATUS_ESCALA[escala.status]?.label ?? escala.status}
                    tone={STATUS_ESCALA[escala.status]?.tone ?? "neutral"}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.semEscalados}>
              Nenhum brigadista escalado neste dia.
            </Text>
          )}
        </Card>
      )}
    </Pressable>
  );
}

export default function AgendaDiaScreen({ navigation, route }) {
  const { data: diaIso } = route.params;
  const { eventos, escalasDoEvento } = useAdminDados();
  const dia = parseIsoDate(diaIso);

  const eventosDoDia = eventosPorDia(eventos, dia.getFullYear(), dia.getMonth())[
    diaIso
  ] ?? [];
  const eventosOrdenados = [...eventosDoDia].sort(
    (a, b) => minutosDoDia(a.dataInicio) - minutosDoDia(b.dataInicio),
  );

  // Abre a escala do evento nesse dia, onde o admin adiciona ou remove brigadistas.
  function abrirEscala(eventoId) {
    navigation.navigate("EscalaEvento", { eventoId, data: diaIso });
  }

  function novoEvento() {
    navigation.navigate("EventoForm", { dataInicial: diaIso });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={formatFullDate(dia)}
          lead={getWeekdayLabel(dia)}
          onBack={() => navigation.goBack()}
        />

        {eventosOrdenados.length ? (
          <View style={styles.lista}>
            {eventosOrdenados.map((evento) => (
              <EventoDoDia
                key={evento.id}
                evento={evento}
                escalas={escalasDoEvento(evento.id).filter(
                  (item) => item.data === diaIso,
                )}
                onPress={() => abrirEscala(evento.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Feather name="calendar" size={22} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>Nenhum evento neste dia.</Text>
          </View>
        )}

        <Button title="+ Novo evento" variant="outline" onPress={novoEvento} />
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
  flex: {
    flex: 1,
  },
  lista: {
    gap: 10,
  },
  eventoCard: {
    gap: 12,
  },
  eventoTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eventoCardPressed: {
    backgroundColor: colors.primaryTint,
  },
  eventoHorario: {
    width: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  eventoHorarioTexto: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  eventoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  eventoLocal: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  eventoEquipe: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  equipeAlerta: {
    fontFamily: fonts.semibold,
    color: colors.warning,
  },
  escalados: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  escalado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  escaladoNome: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  semEscalados: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
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
