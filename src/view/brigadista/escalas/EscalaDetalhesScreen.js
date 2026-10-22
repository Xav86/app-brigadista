import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../../components/Card";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../../theme";

// Dados de exemplo enquanto não há backend. Complementam os dados vindos da lista.
const DETALHES = {
  1: {
    descricao:
      "Treinamento prático de combate a incêndio e primeiros socorros.",
    funcao: "Brigadista",
    responsavel: "Carlos Almeida",
    certificacoes: ["NR-23", "Primeiros Socorros"],
  },
};

const DETALHES_PADRAO = {
  descricao: "Sem descrição disponível.",
  funcao: "Brigadista",
  responsavel: "A definir",
  certificacoes: [],
};

const STATUS = {
  confirmado: {
    pill: "Confirmado",
    tone: "success",
    titulo: "Sua participação está confirmada",
    texto: "Qualquer alteração será comunicada pelo administrador.",
  },
  pendente: {
    pill: "Pendente",
    tone: "warning",
    titulo: "Sua participação ainda não foi confirmada",
    texto: "Você será avisado assim que o administrador responder.",
  },
  concluido: {
    pill: "Concluído",
    tone: "neutral",
    titulo: "Escala concluída",
    texto: "Esta escala já foi realizada.",
  },
};

const TONES = {
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  neutral: { bg: colors.neutralSoft, fg: colors.textMuted },
};

function InfoLinha({ label, valor }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
    </View>
  );
}

export default function EscalaDetalhesScreen({ navigation, route }) {
  const { escala } = route.params;
  const extras = DETALHES[escala.id] ?? DETALHES_PADRAO;
  const status = STATUS[escala.status];
  const tone = TONES[status.tone];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            style={styles.voltar}
            onPress={() => navigation.goBack()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={15} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Detalhes da escala</Text>
        </View>

        <ScrollView contentContainerStyle={styles.main}>
          <Card tinted style={styles.resumo}>
            <View style={styles.data}>
              <Text style={styles.dia}>{escala.dia}</Text>
              <Text style={styles.mes}>{escala.mes}</Text>
            </View>
            <View style={styles.resumoTextos}>
              <Text style={styles.titulo}>{escala.titulo}</Text>
              <Text style={styles.descricao} numberOfLines={2}>
                {extras.descricao}
              </Text>
            </View>
            <StatusPill label={status.pill} tone={status.tone} />
          </Card>

          <Card style={styles.secao}>
            <Text style={styles.secaoTitulo}>Informações do evento</Text>
            <InfoLinha label="Horário" valor={escala.horario} />
            <InfoLinha label="Local" valor={escala.local} />
            <InfoLinha label="Função" valor={extras.funcao} />
            <InfoLinha label="Responsável" valor={extras.responsavel} />
          </Card>

          <Card style={styles.secao}>
            <Text style={styles.secaoTitulo}>Local do evento</Text>
            {/* Placeholder do mapa enquanto não há integração com mapas. */}
            <View style={styles.mapa}>
              <View style={styles.mapaLinhaH} />
              <View style={styles.mapaLinhaV} />
              <View style={styles.pinHalo}>
                <View style={styles.pin} />
              </View>
              <View style={styles.mapaRotuloWrap}>
                <View style={styles.mapaRotulo}>
                  <Text style={styles.mapaRotuloTexto}>{escala.local}</Text>
                </View>
              </View>
            </View>
          </Card>

          <View
            style={[
              styles.participacao,
              { backgroundColor: tone.bg, borderColor: `${tone.fg}33` },
            ]}
          >
            <View style={styles.participacaoTopo}>
              <View style={[styles.ponto, { backgroundColor: tone.fg }]} />
              <Text style={[styles.participacaoTitulo, { color: tone.fg }]}>
                {status.titulo}
              </Text>
            </View>
            <Text style={styles.participacaoTexto}>{status.texto}</Text>
          </View>

          {extras.certificacoes.length ? (
            <Card style={styles.secao}>
              <Text style={styles.secaoTitulo}>Certificações necessárias</Text>
              <View style={styles.certificacoes}>
                {extras.certificacoes.map((c) => (
                  <StatusPill key={c} label={c} tone="primary" />
                ))}
              </View>
            </Card>
          ) : null}
        </ScrollView>
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
    paddingBottom: 0,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voltar: {
    width: 28,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  main: {
    gap: 12,
    paddingBottom: 24,
  },
  resumo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  data: {
    width: 44,
    alignItems: "center",
  },
  dia: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
  },
  mes: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  resumoTextos: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  descricao: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  secao: {
    gap: 12,
  },
  secaoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  infoLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValor: {
    flexShrink: 1,
    textAlign: "right",
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  mapa: {
    height: 120,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mapaLinhaH: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: colors.border,
  },
  mapaLinhaV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: colors.border,
  },
  pinHalo: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: `${colors.primary}33`,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapaRotuloWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: "center",
  },
  mapaRotulo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  mapaRotuloTexto: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.text,
  },
  participacao: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  participacaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  participacaoTitulo: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  participacaoTexto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  certificacoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});