import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../../components/Card";
import { colors, fonts, radius, spacing } from "../../../theme";

// Dados de exemplo enquanto não há backend/armazenamento local.
const NOTIFICACOES_INICIAIS = [
  {
    id: "1",
    grupo: "Hoje",
    tipo: "escala",
    titulo: "Escala se aproximando",
    texto: "Sua escala no Treinamento de Brigada acontece amanhã às 08:00.",
    tempo: "há 10 min",
    lida: false,
  },
  {
    id: "2",
    grupo: "Hoje",
    tipo: "aprovada",
    titulo: "Solicitação aprovada",
    texto: "Sua disponibilidade para o dia 12 de outubro foi aprovada.",
    tempo: "há 32 min",
    lida: true,
  },
  {
    id: "3",
    grupo: "Ontem",
    tipo: "competencia",
    titulo: "Nova competência disponível",
    texto: "O agendamento de novembro já está disponível.",
    tempo: "Ontem",
    lida: true,
  },
  {
    id: "4",
    grupo: "Ontem",
    tipo: "documento",
    titulo: "Documento atualizado",
    texto: "Foi adicionado um novo documento na seção de certificações.",
    tempo: "Ontem",
    lida: true,
  },
  {
    id: "5",
    grupo: "Esta semana",
    tipo: "alteracao",
    titulo: "Alteração de evento",
    texto: "O evento Simulado de Emergência teve alteração de local.",
    tempo: "2 dias",
    lida: true,
  },
  {
    id: "6",
    grupo: "Esta semana",
    tipo: "brigadista",
    titulo: "Novo brigadista na equipe",
    texto: "Maria Santos foi adicionada à equipe da unidade.",
    tempo: "3 dias",
    lida: true,
  },
];

const GRUPOS = ["Hoje", "Ontem", "Esta semana"];

const FILTROS = [
  { key: "todas", label: "Todas" },
  { key: "naoLidas", label: "Não lidas" },
];

// Mesmas cores azuis já usadas na PedidoEnviadoScreen.
const TONES = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  info: { bg: "#DDEEFF", fg: "#2463A6" },
};

const TIPOS = {
  escala: { icon: "calendar", tone: "primary" },
  aprovada: { icon: "check", tone: "success" },
  competencia: { icon: "info", tone: "info" },
  documento: { icon: "info", tone: "info" },
  alteracao: { icon: "alert-circle", tone: "warning" },
  brigadista: { icon: "user-plus", tone: "primary" },
};

function NotificacaoItem({ item, onPress }) {
  const tipo = TIPOS[item.tipo];
  const tone = TONES[tipo.tone];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}${item.lida ? "" : ", não lida"}`}
    >
      {({ pressed }) => (
        <Card
          tinted={!item.lida}
          style={[styles.item, pressed && styles.itemPressed]}
        >
          <View style={[styles.simbolo, { backgroundColor: tone.bg }]}>
            <Feather name={tipo.icon} size={16} color={tone.fg} />
          </View>
          <View style={styles.textos}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.texto} numberOfLines={2}>
              {item.texto}
            </Text>
          </View>
          <View style={styles.lateral}>
            <Text style={styles.tempo}>{item.tempo}</Text>
            {!item.lida ? <View style={styles.ponto} /> : null}
          </View>
        </Card>
      )}
    </Pressable>
  );
}

export default function NotificacoesScreen() {
  const [filtro, setFiltro] = useState("todas");
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);

  const visiveis =
    filtro === "naoLidas" ? notificacoes.filter((n) => !n.lida) : notificacoes;

  function marcarComoLida(id) {
    setNotificacoes((lista) =>
      lista.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.lead}>Acompanhe seus avisos e atualizações.</Text>
        </View>

        <View style={styles.chips}>
          {FILTROS.map((f) => {
            const ativo = filtro === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.chip, ativo && styles.chipAtivo]}
                onPress={() => setFiltro(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text
                  style={[styles.chipLabel, ativo && styles.chipLabelAtivo]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {GRUPOS.map((grupo) => {
          const itens = visiveis.filter((n) => n.grupo === grupo);
          if (!itens.length) return null;

          return (
            <View key={grupo} style={styles.grupo}>
              <Text style={styles.grupoTitulo}>{grupo}</Text>
              {itens.map((n) => (
                <NotificacaoItem
                  key={n.id}
                  item={n}
                  onPress={() => marcarComoLida(n.id)}
                />
              ))}
            </View>
          );
        })}

        {!visiveis.length ? (
          <Text style={styles.vazio}>Nenhuma notificação por aqui.</Text>
        ) : null}
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
  header: {
    gap: 6,
    marginTop: 8,
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
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
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
  grupo: {
    gap: 10,
  },
  grupoTitulo: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemPressed: {
    backgroundColor: colors.primaryTint,
  },
  simbolo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: {
    flex: 1,
    gap: 3,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  texto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  lateral: {
    alignSelf: "stretch",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 36,
  },
  tempo: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
});