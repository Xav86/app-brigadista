import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import { colors, fonts, spacing } from "../../../theme";
import {
  formatShortDate,
  startOfDay,
  toIsoDate,
} from "../../../utils/calendar";
import { contarCertificadosVencendo } from "../../../utils/certificados";
import {
  formatarHorario,
  gerarOcorrencias,
  proximaOcorrencia,
} from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";

const QTD_PROXIMOS_EVENTOS = 2;

function contarEventosDoMes(eventos, hoje) {
  const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return eventos.filter((evento) => {
    const [primeira] = gerarOcorrencias(evento, {
      aPartirDe: inicioDoMes,
      quantidade: 1,
    });
    return (
      primeira &&
      primeira.getMonth() === hoje.getMonth() &&
      primeira.getFullYear() === hoje.getFullYear()
    );
  }).length;
}

function Indicador({ valor, label, cor }) {
  return (
    <Card style={styles.indicador}>
      <Text style={[styles.indicadorValor, { color: cor }]}>{valor}</Text>
      <Text style={styles.indicadorLabel}>{label}</Text>
    </Card>
  );
}

function ProximoEvento({ evento, data, escalados, onPress }) {
  const [dia, mes] = formatShortDate(data).split(" ");

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.evento, pressed && styles.eventoPressed]}>
          <View style={styles.eventoData}>
            <Text style={styles.eventoDia}>{dia}</Text>
            <Text style={styles.eventoMes}>{mes}</Text>
          </View>
          <View style={styles.eventoDetalhes}>
            <Text style={styles.eventoNome} numberOfLines={2}>
              {evento.nome}
            </Text>
            <View style={styles.meta}>
              <Feather name="clock" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{formatarHorario(evento)}</Text>
            </View>
            <Text style={styles.metaText}>
              {escalados}{" "}
              {escalados === 1
                ? "brigadista escalado"
                : "brigadistas escalados"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Card>
      )}
    </Pressable>
  );
}

export default function InicioScreen({ navigation }) {
  const { admin, brigadistas, eventos, solicitacoes, escalasDoEvento } =
    useAdminDados();

  const hoje = startOfDay(new Date());
  const pendentes = solicitacoes.filter((s) => s.status === "pendente").length;

  const proximos = eventos
    .map((evento) => ({ evento, data: proximaOcorrencia(evento) }))
    .filter(({ data }) => data)
    .sort((a, b) => a.data - b.data)
    .slice(0, QTD_PROXIMOS_EVENTOS);

  function irParaEventos() {
    navigation.navigate("Eventos");
  }

  // Abre o formulário dentro da aba Eventos, mantendo a lista por baixo para o "voltar".
  function abrirFormularioEvento(eventoId) {
    navigation.navigate("Eventos", {
      screen: "EventoForm",
      params: eventoId ? { eventoId } : undefined,
      initial: false,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Painel administrativo</Text>
          <Text style={styles.lead}>Olá, {admin.nome}</Text>
        </View>

        <Card tinted style={styles.solicitacoes}>
          <View style={styles.solicitacoesTopo}>
            <Text style={styles.solicitacoesNumero}>{pendentes}</Text>
            <View style={styles.flex}>
              <Text style={styles.cardTitulo}>Solicitações pendentes</Text>
              <Text style={styles.cardTexto}>
                {pendentes
                  ? "Disponibilidades aguardando análise."
                  : "Nenhuma disponibilidade aguardando análise."}
              </Text>
            </View>
          </View>
          <Button
            title="Analisar solicitações"
            rightIcon="arrow-right"
            onPress={() => navigation.navigate("Solicitacoes")}
          />
        </Card>

        <Text style={styles.sectionTitle}>Visão geral</Text>
        <View style={styles.indicadores}>
          <Indicador
            valor={brigadistas.length}
            label="Brigadistas ativos"
            cor={colors.primary}
          />
          <Indicador
            valor={contarEventosDoMes(eventos, hoje)}
            label="Eventos do mês"
            cor={colors.primary}
          />
          <Indicador
            valor={contarCertificadosVencendo(brigadistas, 60, hoje)}
            label="Certificações vencendo"
            cor={colors.warning}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
          <Pressable
            onPress={irParaEventos}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text style={styles.link}>Ver todos ›</Text>
          </Pressable>
        </View>

        {proximos.length ? (
          <View style={styles.lista}>
            {proximos.map(({ evento, data }) => (
              <ProximoEvento
                key={evento.id}
                evento={evento}
                data={data}
                escalados={
                  escalasDoEvento(evento.id).filter(
                    (item) => item.data === toIsoDate(data),
                  ).length
                }
                onPress={() => abrirFormularioEvento(evento.id)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.vazio}>Nenhum evento agendado.</Text>
        )}

        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.lista}>
          <Button
            title="Agendamento manual"
            variant="soft"
            rightIcon="arrow-right"
            onPress={() => navigation.navigate("AgendamentoManual")}
          />
          <Button
            title="Criar evento"
            rightIcon="arrow-right"
            onPress={() => abrirFormularioEvento()}
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
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  header: {
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  solicitacoes: {
    gap: 14,
  },
  solicitacoesTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  solicitacoesNumero: {
    minWidth: 44,
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.primary,
  },
  cardTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  cardTexto: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  indicadores: {
    flexDirection: "row",
    gap: 10,
  },
  indicador: {
    flex: 1,
    gap: 6,
    paddingVertical: 16,
  },
  indicadorValor: {
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  indicadorLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
  lista: {
    gap: 10,
  },
  evento: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  eventoPressed: {
    backgroundColor: colors.primaryTint,
  },
  eventoData: {
    width: 40,
    alignItems: "center",
  },
  eventoDia: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.primary,
  },
  eventoMes: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  eventoDetalhes: {
    flex: 1,
    gap: 6,
  },
  eventoNome: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
});
