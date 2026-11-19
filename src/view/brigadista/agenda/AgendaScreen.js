import { Feather } from "@expo/vector-icons";
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

import Card from "../../../components/Card";
import EventCard from "../../../components/EventCard";
import MonthCalendar from "../../../components/MonthCalendar";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../../theme";
import {
  DIAS_SEMANA_CURTOS,
  formatRelativeDays,
  formatShortDate,
  parseIsoDate,
} from "../../../utils/calendar";
import { useBrigadistaDados } from "../useBrigadistaDados";
import { useAgendaMonth } from "./useAgendaMonth";

const STATUS_EVENTO = {
  confirmado: { label: "Confirmada", tone: "success" },
  pendente: { label: "Aguardando", tone: "warning" },
  disponivel: { label: "Disponível", tone: "primary" },
  recusado: { label: "Indisponível", tone: "neutral" },
};

const STATUS_PEDIDO = {
  pendente: { label: "Pendente", tone: "warning" },
  aprovada: { label: "Aprovada", tone: "success" },
  recusada: { label: "Recusada", tone: "neutral" },
};

function DataChip({ iso }) {
  const data = parseIsoDate(iso);
  return (
    <View style={styles.dataChip}>
      <Text style={styles.dataChipTexto}>{formatShortDate(data)}</Text>
      <Text style={styles.dataChipDia}>
        {DIAS_SEMANA_CURTOS[data.getDay()]}
      </Text>
    </View>
  );
}

export default function AgendaScreen({ navigation }) {
  const { ano, mes, mesAnterior, proximoMes } = useAgendaMonth();
  const { compromissosDoMes, solicitacoes, carregando } = useBrigadistaDados();
  const [abaAtiva, setAbaAtiva] = useState("agenda"); // "agenda" | "pedidos"

  const eventosDoMes = compromissosDoMes(ano, mes);
  const pedidosOrdenados = [...solicitacoes].sort(
    (a, b) => b.enviadaEm - a.enviadaEm,
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Minha agenda</Text>
          <Text style={styles.lead}>
            Visualize seus compromissos e acompanhe seus pedidos.
          </Text>
        </View>

        <View style={styles.chips}>
          <Pressable
            style={[styles.chip, abaAtiva === "agenda" && styles.chipAtivo]}
            onPress={() => setAbaAtiva("agenda")}
          >
            <Text
              style={[
                styles.chipLabel,
                abaAtiva === "agenda" && styles.chipLabelAtivo,
              ]}
            >
              Agenda
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, abaAtiva === "pedidos" && styles.chipAtivo]}
            onPress={() => setAbaAtiva("pedidos")}
          >
            <Text
              style={[
                styles.chipLabel,
                abaAtiva === "pedidos" && styles.chipLabelAtivo,
              ]}
            >
              Histórico de escala ({solicitacoes.length})
            </Text>
          </Pressable>
        </View>

        {abaAtiva === "agenda" ? (
          <>
            <MonthCalendar
              ano={ano}
              mes={mes}
              onMesAnterior={mesAnterior}
              onProximoMes={proximoMes}
              diasDestacados={eventosDoMes.map((evento) => evento.dataIso)}
              onDiaPress={(iso) => {
                const ev = eventosDoMes.find((item) => item.dataIso === iso);
                if (ev) {
                  navigation.navigate("ConfirmarPresenca", {
                    evento: {
                      id: ev.id,
                      eventoId: ev.eventoId,
                      titulo: ev.titulo,
                      descricao: ev.descricao,
                      data: ev.dataIso,
                      horario: ev.horario,
                      local: ev.local,
                      certificacoes: ev.certificacoes,
                    },
                  });
                }
              }}
            />

            <View style={styles.compromissos}>
              <View style={styles.compromissosHeader}>
                <Text style={styles.sectionTitle}>Compromissos do mês</Text>
              </View>

              {carregando ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loading}
                />
              ) : eventosDoMes.length ? (
                eventosDoMes.map((evento) => {
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
                })
              ) : (
                <Text style={styles.vazio}>Nenhum compromisso neste mês.</Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.pedidosWrap}>
            <View style={styles.compromissosHeader}>
              <Text style={styles.sectionTitle}>
                Solicitações enviadas ao administrador
              </Text>
            </View>

            {pedidosOrdenados.length ? (
              pedidosOrdenados.map((pedido) => {
                const st =
                  STATUS_PEDIDO[pedido.status] ?? STATUS_PEDIDO.pendente;
                return (
                  <Card key={pedido.id} style={styles.pedidoCard}>
                    <View style={styles.pedidoTopo}>
                      <View style={styles.flex}>
                        <Text style={styles.pedidoTitulo}>
                          {pedido.eventoNome ||
                            `Disponibilidade (${pedido.datas.length} ${
                              pedido.datas.length === 1 ? "dia" : "dias"
                            })`}
                        </Text>
                        <Text style={styles.pedidoMeta}>
                          Enviado {formatRelativeDays(pedido.enviadaEm)}
                        </Text>
                      </View>
                      <StatusPill label={st.label} tone={st.tone} />
                    </View>

                    <View style={styles.datasRow}>
                      {pedido.datas.map((iso) => (
                        <DataChip key={iso} iso={iso} />
                      ))}
                    </View>

                    {pedido.motivo ? (
                      <Text style={styles.motivoTexto}>
                        Observação: {pedido.motivo}
                      </Text>
                    ) : null}
                  </Card>
                );
              })
            ) : (
              <View style={styles.vazioBox}>
                <Feather name="inbox" size={26} color={colors.textFaint} />
                <Text style={styles.vazio}>
                  Você ainda não enviou solicitações de disponibilidade.
                </Text>
              </View>
            )}
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
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    gap: 6,
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
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
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
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
  loading: {
    paddingVertical: 24,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  pedidosWrap: {
    gap: 12,
  },
  pedidoCard: {
    gap: 10,
  },
  pedidoTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pedidoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  pedidoMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  datasRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dataChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  dataChipTexto: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
  },
  dataChipDia: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },
  motivoTexto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textMuted,
  },
  vazioBox: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
  },
});
