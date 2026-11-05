import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import { colors, fonts, spacing } from "../../../theme";
import { formatFullDate, getWeekdayLabel, parseIsoDate } from "../../../utils/calendar";
import { eventosPorDia, formatarHorario } from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";

function minutosDoDia(data) {
  return data.getHours() * 60 + data.getMinutes();
}

function EventoDoDia({ evento, escalados, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.eventoCard, pressed && styles.eventoCardPressed]}>
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
            <Text style={styles.eventoEquipe}>
              {escalados}{" "}
              {escalados === 1 ? "brigadista escalado" : "brigadistas escalados"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
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

  function abrirEvento(eventoId) {
    navigation.getParent()?.navigate("Eventos", {
      screen: "EventoForm",
      params: { eventoId },
    });
  }

  function novoEvento() {
    navigation.getParent()?.navigate("Eventos", {
      screen: "EventoForm",
      params: { dataInicial: diaIso },
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

        {eventosOrdenados.length ? (
          <View style={styles.lista}>
            {eventosOrdenados.map((evento) => (
              <EventoDoDia
                key={evento.id}
                evento={evento}
                escalados={
                  escalasDoEvento(evento.id).filter((item) => item.data === diaIso)
                    .length
                }
                onPress={() => abrirEvento(evento.id)}
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
