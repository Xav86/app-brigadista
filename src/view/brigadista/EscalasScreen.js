import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../components/Card";
import EventCard from "../../components/EventCard";
import { colors, fonts, spacing } from "../../theme";
import { useBrigadistaDados } from "./useBrigadistaDados";

const STATUS = {
  confirmado: { label: "Confirmado", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  proposto: { label: "Proposto", tone: "warning" },
  concluido: { label: "Concluído", tone: "neutral" },
  recusado: { label: "Recusado", tone: "neutral" },
};

const ABAS = [
  { key: "proximas", label: "Próximas" },
  { key: "anteriores", label: "Anteriores" },
];

export default function MinhasEscalas({ navigation }) {
  const [aba, setAba] = useState("proximas");
  const { escalasProximas, escalasAnteriores, carregando } =
    useBrigadistaDados();

  const lista = aba === "proximas" ? escalasProximas : escalasAnteriores;

  function irParaAgenda() {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate("Agenda");
    } else {
      navigation.navigate("Agenda");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas escalas</Text>
          <Text style={styles.lead}>
            Acompanhe suas escalas confirmadas e histórico de participação.
          </Text>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {ABAS.map((a) => {
            const ativa = aba === a.key;
            return (
              <Pressable
                key={a.key}
                style={styles.tab}
                onPress={() => setAba(a.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
              >
                <Text style={[styles.tabLabel, ativa && styles.tabLabelAtiva]}>
                  {a.label}
                </Text>
                <View
                  style={[styles.underline, ativa && styles.underlineAtiva]}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.lista}>
          {carregando ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : lista.length ? (
            lista.map((e) => {
              const statusInfo = STATUS[e.status] ?? STATUS.pendente;
              return (
                <EventCard
                  key={e.id}
                  dia={e.dia}
                  mes={e.mes}
                  titulo={e.titulo}
                  horario={e.horario}
                  local={e.local}
                  statusLabel={statusInfo.label}
                  statusTone={statusInfo.tone}
                  passado={e.status === "concluido"}
                  onPress={() =>
                    navigation.navigate("EscalaDetalhes", { escala: e })
                  }
                />
              );
            })
          ) : (
            <Text style={styles.vazio}>Nenhuma escala por aqui.</Text>
          )}
        </View>

        <Card style={styles.calendario}>
          <View style={styles.calendarioHeader}>
            <Text style={styles.calendarioTitulo}>Calendário</Text>
            <Pressable
              onPress={irParaAgenda}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={styles.link}>Ver calendário completo ›</Text>
            </Pressable>
          </View>
          <Text style={styles.metaText}>
            Visualize suas escalas em formato de calendário e tenha uma visão
            completa do mês.
          </Text>
        </Card>
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
  header: {
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
  },
  tabLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    paddingBottom: 10,
  },
  tabLabelAtiva: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  underline: {
    height: 2,
    width: "70%",
    borderRadius: 1,
    marginBottom: -1,
  },
  underlineAtiva: {
    backgroundColor: colors.primary,
  },
  lista: {
    gap: 12,
  },
  loading: {
    paddingVertical: 24,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
  calendario: {
    marginTop: 16,
    gap: 6,
  },
  calendarioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarioTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
});
