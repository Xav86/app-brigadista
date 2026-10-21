import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import EventSummary from "../../../components/EventSummary";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import { parseIsoDate } from "../../../utils/calendar";

const RESPOSTA = {
  disponivel: { label: "Disponível", tone: "success" },
  indisponivel: { label: "Indisponível", tone: "neutral" },
};

export default function PedidoEnviadoScreen({ navigation, route }) {
  const { evento, resposta } = route.params;
  const respostaInfo = RESPOSTA[resposta];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcone}>
            <Feather name="check-circle" size={34} color={colors.success} />
          </View>
          <Text style={styles.heroTitulo}>Resposta enviada!</Text>
          <Text style={styles.heroTexto}>
            Sua resposta foi enviada para análise do administrador.
          </Text>
          <View style={styles.statusChip}>
            <Feather name="clock" size={12} color={colors.warning} />
            <Text style={styles.statusTexto}>Aguardando aprovação</Text>
          </View>
        </View>

        <Card style={styles.eventoCard}>
          <View style={styles.eventoHeader}>
            <Text style={styles.sectionTitle}>Sua resposta</Text>
            <StatusPill label={respostaInfo.label} tone={respostaInfo.tone} />
          </View>
          <EventSummary
            titulo={evento.titulo}
            data={parseIsoDate(evento.data)}
            horario={evento.horario}
            local={evento.local}
          />
        </Card>

        <View style={styles.notificacao}>
          <View style={styles.notificacaoIcone}>
            <Feather name="bell" size={14} color="#2463A6" />
          </View>
          <Text style={styles.notificacaoTexto}>
            Você será notificado assim que o administrador analisar sua resposta.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <Button title="Voltar para a agenda" onPress={() => navigation.popToTop()} />
      </View>
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
    paddingBottom: 16,
    gap: 14,
  },
  hero: {
    alignItems: "center",
    gap: 7,
    paddingTop: 18,
    paddingBottom: 6,
  },
  heroIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitulo: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },
  heroTexto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: "center",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.warningSoft,
  },
  statusTexto: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.warning,
  },
  eventoCard: {
    gap: 10,
  },
  eventoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
  },
  notificacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#EEF7FF",
  },
  notificacaoIcone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#DDEEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  notificacaoTexto: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: "#2463A6",
  },
  rodape: {
    padding: spacing.screen,
    paddingTop: 0,
  },
});
