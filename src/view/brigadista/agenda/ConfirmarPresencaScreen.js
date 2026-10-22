import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import EventSummary from "../../../components/EventSummary";
import { colors, fonts, spacing } from "../../../theme";
import { parseIsoDate } from "../../../utils/calendar";

export default function ConfirmarPresencaScreen({ navigation, route }) {
  const { evento } = route.params;

  function responder(resposta) {
    navigation.replace("PedidoEnviado", { evento, resposta });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.voltar} onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="arrow-left" size={15} color={colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Confirmar presença</Text>
            <Text style={styles.lead}>Informe se você vai participar deste evento.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.main}>
          <Card style={styles.eventoCard}>
            <EventSummary
              titulo={evento.titulo}
              data={parseIsoDate(evento.data)}
              horario={evento.horario}
              local={evento.local}
            />
          </Card>

          <Card tinted style={styles.aviso}>
            <View style={styles.avisoIcone}>
              <Feather name="bell" size={14} color={colors.primary} />
            </View>
            <View style={styles.avisoTexto}>
              <Text style={styles.avisoTitulo}>Análise do administrador</Text>
              <Text style={styles.avisoCorpo}>
                Sua resposta será analisada pelo administrador. Você receberá uma notificação
                assim que houver uma atualização.
              </Text>
            </View>
          </Card>
        </ScrollView>

        <View style={styles.acoes}>
          <Button title="Vou participar" rightIcon="check" onPress={() => responder("disponivel")} />
          <Button
            title="Não vou poder participar"
            variant="outline"
            onPress={() => responder("indisponivel")}
          />
        </View>
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
    flex: 1,
    padding: spacing.screen,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  voltar: {
    width: 28,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  main: {
    gap: 12,
  },
  eventoCard: {
    padding: 14,
  },
  aviso: {
    flexDirection: "row",
    gap: 10,
  },
  avisoIcone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avisoTexto: {
    flex: 1,
    gap: 3,
  },
  avisoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  avisoCorpo: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
  acoes: {
    gap: 8,
  },
});
