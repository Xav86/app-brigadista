import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/Button";
import Card from "../../components/Card";
import StatusPill from "../../components/StatusPill";
import { colors, fonts, spacing } from "../../theme";
import { useBrigadistaDados } from "./useBrigadistaDados";

export default function InicioBrigadista({ navigation }) {
  const { brigadista, escalasProximas, solicitacoes } = useBrigadistaDados();

  const primeiroNome = brigadista?.nome
    ? brigadista.nome.trim().split(" ")[0]
    : "Brigadista";

  const proximaEscala = escalasProximas[0] ?? null;
  const confirmadasCount = escalasProximas.filter(
    (e) => e.status === "confirmado",
  ).length;
  const pendentesCount = solicitacoes.filter(
    (s) => s.status === "pendente",
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {primeiroNome}!</Text>
          <Text style={styles.lead}>
            Acompanhe suas escalas e informe sua disponibilidade.
          </Text>
        </View>

        <Card tinted style={styles.gap}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>Próxima escala</Text>
            {proximaEscala ? (
              <StatusPill
                label={
                  proximaEscala.status === "confirmado"
                    ? "Confirmada"
                    : "Pendente"
                }
                tone={
                  proximaEscala.status === "confirmado" ? "success" : "warning"
                }
              />
            ) : null}
          </View>

          {proximaEscala ? (
            <>
              <View style={styles.escala}>
                <View style={styles.data}>
                  <Text style={styles.dia}>{proximaEscala.dia}</Text>
                  <Text style={styles.mes}>{proximaEscala.mes}</Text>
                </View>
                <View style={styles.detalhes}>
                  <Text style={styles.escalaTitulo}>
                    {proximaEscala.titulo}
                  </Text>
                  <View style={styles.meta}>
                    <Feather name="clock" size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>{proximaEscala.horario}</Text>
                  </View>
                  <View style={styles.meta}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.metaText}>{proximaEscala.local}</Text>
                  </View>
                </View>
              </View>

              <Button
                title="Ver detalhes da escala"
                rightIcon="arrow-right"
                onPress={() =>
                  navigation.navigate("Escalas", {
                    screen: "EscalaDetalhes",
                    params: { escala: proximaEscala },
                    initial: false,
                  })
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.body}>
                Você ainda não possui escalas futuras agendadas. Confira os
                eventos do mês na agenda ou envie sua disponibilidade.
              </Text>
              <Button
                title="Ver agenda e eventos"
                rightIcon="arrow-right"
                onPress={() => navigation.navigate("Agenda")}
              />
            </>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Seu resumo</Text>
        <View style={styles.indicadores}>
          <Pressable
            style={styles.flex}
            onPress={() => navigation.navigate("Escalas")}
          >
            <Card style={styles.indicador}>
              <Text style={[styles.numero, { color: colors.primary }]}>
                {confirmadasCount}
              </Text>
              <Text style={styles.indicadorLabel}>Escalas confirmadas</Text>
            </Card>
          </Pressable>
          <Pressable
            style={styles.flex}
            onPress={() => navigation.navigate("Agenda")}
          >
            <Card style={styles.indicador}>
              <Text style={[styles.numero, { color: colors.warning }]}>
                {pendentesCount}
              </Text>
              <Text style={styles.indicadorLabel}>
                {pendentesCount === 1
                  ? "Solicitação pendente"
                  : "Solicitações pendentes"}
              </Text>
            </Card>
          </Pressable>
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
  },
  flex: {
    flex: 1,
  },
  header: {
    gap: 6,
    marginTop: 8,
    marginBottom: 20,
  },
  greeting: {
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
  gap: {
    gap: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  escala: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  data: {
    width: 52,
    alignItems: "center",
  },
  dia: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.primary,
  },
  mes: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  detalhes: {
    flex: 1,
    gap: 4,
  },
  escalaTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginTop: 24,
    marginBottom: 10,
  },
  indicadores: {
    flexDirection: "row",
    gap: 12,
  },
  indicador: {
    minHeight: 100,
    justifyContent: "space-between",
  },
  numero: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  indicadorLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});
