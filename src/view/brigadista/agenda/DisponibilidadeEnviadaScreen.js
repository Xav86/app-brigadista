import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import DateListItem from "../../../components/DateListItem";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import {
  formatDayMonth,
  getWeekdayLabel,
  parseIsoDate,
} from "../../../utils/calendar";

export default function DisponibilidadeEnviadaScreen({ navigation, route }) {
  const { datas } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcone}>
            <Feather name="check" size={34} color={colors.success} />
          </View>
          <Text style={styles.heroTitulo}>Disponibilidade enviada!</Text>
          <Text style={styles.heroTexto}>
            Suas datas foram registradas com sucesso e serão analisadas pelo
            administrador.
          </Text>
          <View style={styles.statusChip}>
            <Feather name="clock" size={12} color={colors.warning} />
            <Text style={styles.statusTexto}>Aguardando aprovação</Text>
          </View>
        </View>

        <Card style={styles.datas}>
          <View style={styles.datasTopo}>
            <Text style={styles.sectionTitle}>
              Datas selecionadas ({datas.length})
            </Text>
            <StatusPill label="Aguardando" tone="warning" />
          </View>

          {datas.map((iso) => {
            const data = parseIsoDate(iso);
            return (
              <DateListItem
                key={iso}
                data={data}
                icon="clock"
                titulo={formatDayMonth(data)}
                subtitulo={getWeekdayLabel(data)}
              />
            );
          })}

          <View style={styles.notificacao}>
            <View style={styles.notificacaoIcone}>
              <Feather name="info" size={14} color="#2463A6" />
            </View>
            <Text style={styles.notificacaoTexto}>
              Você será notificado assim que o administrador analisar sua
              solicitação.
            </Text>
          </View>
        </Card>

        <View style={styles.acoes}>
          <Button
            title="Voltar para a agenda"
            rightIcon="arrow-right"
            onPress={() => navigation.popToTop()}
          />
          <Button
            title="Solicitar outras datas"
            variant="outline"
            onPress={() => navigation.replace("SolicitarDisponibilidade")}
          />
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
    gap: 16,
  },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingTop: 24,
  },
  heroIcone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitulo: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
    textAlign: "center",
  },
  heroTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.warningSoft,
  },
  statusTexto: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.warning,
  },
  datas: {
    gap: 14,
  },
  datasTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  notificacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 11,
    borderRadius: 13,
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
    fontSize: 12,
    lineHeight: 16,
    color: "#2463A6",
  },
  acoes: {
    gap: 10,
  },
});
