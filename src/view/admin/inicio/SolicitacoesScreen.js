import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import FilterChips from "../../../components/FilterChips";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import TextField from "../../../components/TextField";
import { colors, fonts, radius, spacing } from "../../../theme";
import {
  DIAS_SEMANA_CURTOS,
  formatRelativeDays,
  formatShortDate,
  parseIsoDate,
} from "../../../utils/calendar";
import { extrairIniciais } from "../gestao/useBrigadistas";
import { useAdminDados } from "../useAdminDados";

const TAMANHO_MINIMO_MOTIVO = 5;

const STATUS = {
  pendente: { label: "Pendente", tone: "warning" },
  aprovada: { label: "Aprovada", tone: "success" },
  recusada: { label: "Recusada", tone: "neutral" },
};

const VAZIO = {
  pendente: "Nenhuma solicitação aguardando análise.",
  aprovada: "Nenhuma solicitação aprovada ainda.",
  recusada: "Nenhuma solicitação recusada.",
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

function SolicitacaoCard({
  pedido,
  brigadista,
  selecionada,
  onAlternar,
  onAprovar,
  onRecusar,
}) {
  const pendente = pedido.status === "pendente";
  const certificacoes = brigadista.certificados
    .map((item) => item.nomeCertificado)
    .join(" • ");

  return (
    <Card style={[styles.card, selecionada && styles.cardSelecionado]}>
      <View style={styles.cardTopo}>
        {pendente ? (
          <Pressable
            onPress={onAlternar}
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selecionada }}
            accessibilityLabel={`Selecionar ${brigadista.nome}`}
            style={[styles.checkbox, selecionada && styles.checkboxMarcado]}
          >
            {selecionada ? (
              <Feather name="check" size={13} color="#FFFFFF" />
            ) : null}
          </Pressable>
        ) : null}
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {extrairIniciais(brigadista.nome)}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.nome}>{brigadista.nome}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {certificacoes || "Sem certificações"}
          </Text>
        </View>
        {pendente ? (
          <Text style={styles.meta}>
            {formatRelativeDays(pedido.enviadaEm)}
          </Text>
        ) : (
          <StatusPill
            label={STATUS[pedido.status].label}
            tone={STATUS[pedido.status].tone}
          />
        )}
      </View>

      <Text style={styles.subtitulo}>
        {pedido.datas.length}{" "}
        {pedido.datas.length === 1 ? "data informada" : "datas informadas"}
      </Text>
      <View style={styles.datas}>
        {pedido.datas.map((iso) => (
          <DataChip key={iso} iso={iso} />
        ))}
      </View>

      {pedido.motivo ? (
        <Text style={styles.motivo}>Motivo: {pedido.motivo}</Text>
      ) : null}

      {pendente ? (
        <View style={styles.acoes}>
          <Button
            title="Recusar"
            variant="outline"
            onPress={onRecusar}
            style={[styles.acao, styles.flex]}
          />
          <Button
            title="Aprovar"
            onPress={onAprovar}
            style={[styles.acao, styles.flex]}
          />
        </View>
      ) : null}
    </Card>
  );
}

function RecusarModal({ pedidos, onCancelar, onConfirmar }) {
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState(null);

  function confirmar() {
    if (motivo.trim().length < TAMANHO_MINIMO_MOTIVO) {
      setErro("Explique o motivo em poucas palavras para o brigadista");
      return;
    }
    onConfirmar(motivo.trim());
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={styles.modalFundo}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitulo}>
            {pedidos.length === 1
              ? "Recusar solicitação"
              : `Recusar ${pedidos.length} solicitações`}
          </Text>
          <Text style={styles.modalTexto}>
            O brigadista vai receber este motivo junto com a resposta.
          </Text>
          <TextField
            placeholder="Ex.: a equipe deste dia já está completa"
            value={motivo}
            onChangeText={(texto) => {
              setMotivo(texto);
              setErro(null);
            }}
            error={erro}
            multiline
            maxLength={200}
            autoFocus
          />
          <View style={styles.acoes}>
            <Button
              title="Voltar"
              variant="outline"
              onPress={onCancelar}
              style={[styles.acao, styles.flex]}
            />
            <Button
              title="Recusar"
              onPress={confirmar}
              style={[styles.acao, styles.flex]}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SolicitacoesScreen({ navigation }) {
  const { solicitacoes, buscarBrigadista, responderSolicitacoes } =
    useAdminDados();
  const [filtro, setFiltro] = useState("pendente");
  const [selecionadas, setSelecionadas] = useState([]);
  const [recusando, setRecusando] = useState(null);

  const contagem = (status) =>
    solicitacoes.filter((pedido) => pedido.status === status).length;

  const filtros = [
    { key: "pendente", label: `Pendentes (${contagem("pendente")})` },
    { key: "aprovada", label: "Aprovadas" },
    { key: "recusada", label: "Recusadas" },
  ];

  const visiveis = solicitacoes
    .filter((pedido) => pedido.status === filtro)
    .sort((a, b) => a.enviadaEm - b.enviadaEm);

  const pendentesIds = visiveis.map((pedido) => pedido.id);
  const todasSelecionadas =
    filtro === "pendente" &&
    pendentesIds.length > 0 &&
    pendentesIds.every((id) => selecionadas.includes(id));

  function alternar(id) {
    setSelecionadas((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
    );
  }

  function aprovar(ids) {
    responderSolicitacoes(ids, "aprovada");
    setSelecionadas((atuais) => atuais.filter((id) => !ids.includes(id)));
  }

  function confirmarRecusa(motivo) {
    responderSolicitacoes(recusando, "recusada", motivo);
    setSelecionadas((atuais) => atuais.filter((id) => !recusando.includes(id)));
    setRecusando(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Solicitações"
          lead="Analise as disponibilidades enviadas pelos brigadistas."
          onBack={() => navigation.goBack()}
        />

        <FilterChips
          opcoes={filtros}
          valor={filtro}
          onChange={(valor) => {
            setFiltro(valor);
            setSelecionadas([]);
          }}
        />

        {filtro === "pendente" && visiveis.length > 1 ? (
          <Pressable
            onPress={() =>
              setSelecionadas(todasSelecionadas ? [] : pendentesIds)
            }
            hitSlop={8}
            accessibilityRole="button"
            style={styles.selecionarTodas}
          >
            <Text style={styles.link}>
              {todasSelecionadas ? "Limpar seleção" : "Selecionar todas"}
            </Text>
          </Pressable>
        ) : null}

        {visiveis.length ? (
          visiveis.map((pedido) => (
            <SolicitacaoCard
              key={pedido.id}
              pedido={pedido}
              brigadista={buscarBrigadista(pedido.brigadistaId)}
              selecionada={selecionadas.includes(pedido.id)}
              onAlternar={() => alternar(pedido.id)}
              onAprovar={() => aprovar([pedido.id])}
              onRecusar={() => setRecusando([pedido.id])}
            />
          ))
        ) : (
          <View style={styles.vazio}>
            <Feather name="inbox" size={28} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>{VAZIO[filtro]}</Text>
          </View>
        )}
      </ScrollView>

      {selecionadas.length ? (
        <View style={styles.lote}>
          <Text style={styles.loteTexto}>
            {selecionadas.length}{" "}
            {selecionadas.length === 1 ? "selecionada" : "selecionadas"}
          </Text>
          <View style={styles.acoes}>
            <Button
              title="Recusar"
              variant="outline"
              onPress={() => setRecusando(selecionadas)}
              style={[styles.acao, styles.flex]}
            />
            <Button
              title="Aprovar"
              onPress={() => aprovar(selecionadas)}
              style={[styles.acao, styles.flex]}
            />
          </View>
        </View>
      ) : null}

      {recusando ? (
        <RecusarModal
          pedidos={recusando}
          onCancelar={() => setRecusando(null)}
          onConfirmar={confirmarRecusa}
        />
      ) : null}
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
    gap: 12,
  },
  selecionarTodas: {
    alignSelf: "flex-end",
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  card: {
    gap: 10,
  },
  cardSelecionado: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxMarcado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  subtitulo: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  datas: {
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
  motivo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textMuted,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  acao: {
    minHeight: 40,
  },
  vazio: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 48,
  },
  vazioTexto: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  lote: {
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  loteTexto: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.screen,
    backgroundColor: "rgba(28, 31, 38, 0.4)",
  },
  modal: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  modalTitulo: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  modalTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
