import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import CandidatoBrigadista from "../../../components/CandidatoBrigadista";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../../theme";
import { montarCandidatos } from "../../../utils/agendamento";
import {
  formatFullDate,
  getWeekdayLabel,
  parseIsoDate,
} from "../../../utils/calendar";
import {
  descreverEquipe,
  equipeIncompleta,
  formatarHorario,
} from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";

const STATUS_ESCALA = {
  confirmado: { label: "Confirmado", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  proposto: { label: "Proposto", tone: "neutral" },
  recusado: { label: "Recusado", tone: "primary" },
};

// Alert.alert com botões não aparece no Expo Web, então lá usamos o confirm do navegador.
function confirmar(titulo, mensagem, onConfirmar) {
  if (Platform.OS === "web") {
    if (window.confirm(`${titulo}\n${mensagem}`)) onConfirmar();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: "Cancelar", style: "cancel" },
    { text: "Remover", style: "destructive", onPress: onConfirmar },
  ]);
}

function avisar(titulo, mensagem) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

function Escalado({ escala, removendo, onRemover }) {
  const status = STATUS_ESCALA[escala.status] ?? {
    label: escala.status,
    tone: "neutral",
  };

  return (
    <View style={styles.escalado}>
      <View style={styles.avatar}>
        <Feather name="user" size={14} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.escaladoNome} numberOfLines={1}>
          {escala.brigadistaNome}
        </Text>
        <Text style={styles.escaladoOrigem} numberOfLines={1}>
          {escala.origem === "manual_admin"
            ? "Adicionado pelo admin"
            : "Pediu este dia"}
        </Text>
      </View>
      <StatusPill label={status.label} tone={status.tone} />
      <Pressable
        onPress={onRemover}
        disabled={removendo}
        hitSlop={8}
        style={[styles.remover, removendo && styles.removendo]}
      >
        <Feather name="user-minus" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export default function EscalaEventoScreen({ navigation, route }) {
  const { eventoId, data: dataIso } = route.params;
  const {
    brigadistas,
    escalas,
    solicitacoes,
    tiposCertificados,
    buscarEvento,
    adicionarEscalas,
    removerEscala,
  } = useAdminDados();

  const [selecionados, setSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);
  const [erro, setErro] = useState(null);

  const evento = buscarEvento(eventoId);
  const dia = parseIsoDate(dataIso);

  // Todas as escalas desse evento nesse dia (inclusive recusadas, para o admin poder tirar).
  const escalasDoDia = escalas
    .filter((item) => item.eventoId === eventoId && item.data === dataIso)
    .sort((a, b) => a.brigadistaNome.localeCompare(b.brigadistaNome, "pt-BR"));
  const naEquipe = escalasDoDia.filter((item) => item.status !== "recusado");

  const candidatos = evento
    ? montarCandidatos({
        brigadistas,
        escalas,
        solicitacoes,
        evento,
        dataIso,
        tiposCertificados,
      }).filter((item) => !item.jaEscalado)
    : [];
  const disponiveis = candidatos.filter((item) => item.disponivel).length;
  const comPendencia = candidatos.filter(
    (item) =>
      selecionados.includes(item.brigadista.id) && item.pendencias.length,
  );

  function alternar(brigadistaId) {
    setErro(null);
    if (selecionados.includes(brigadistaId)) {
      setSelecionados(selecionados.filter((id) => id !== brigadistaId));
    } else {
      setSelecionados([...selecionados, brigadistaId]);
    }
  }

  async function adicionar() {
    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um brigadista");
      return;
    }
    try {
      setSalvando(true);
      await adicionarEscalas(eventoId, dataIso, selecionados);
      setSelecionados([]);
    } catch (err) {
      avisar(
        "Não foi possível adicionar",
        err?.message || "Tente novamente em instantes.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function pedirRemocao(escala) {
    confirmar(
      "Remover da escala",
      `Tirar ${escala.brigadistaNome} da escala de ${evento?.nome ?? "evento"}?`,
      () => remover(escala.id),
    );
  }

  async function remover(escalaId) {
    try {
      setRemovendoId(escalaId);
      await removerEscala(escalaId);
    } catch (err) {
      avisar(
        "Não foi possível remover",
        err?.message || "Tente novamente em instantes.",
      );
    } finally {
      setRemovendoId(null);
    }
  }

  function editarEvento() {
    navigation.navigate("EventoForm", { eventoId });
  }

  if (!evento) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader title="Escala" onBack={() => navigation.goBack()} />
          <View style={styles.vazio}>
            <Feather name="calendar" size={22} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>Este evento não existe mais.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const cabecalho = (
    <View style={styles.cabecalho}>
      <ScreenHeader
        title={evento.nome}
        lead={`${formatFullDate(dia)} • ${getWeekdayLabel(dia)}`}
        onBack={() => navigation.goBack()}
      />

      <Card style={styles.resumo}>
        <View style={styles.meta}>
          <Feather name="clock" size={13} color={colors.textMuted} />
          <Text style={styles.metaTexto}>{formatarHorario(evento)}</Text>
        </View>
        <View style={styles.meta}>
          <Feather name="map-pin" size={13} color={colors.textMuted} />
          <Text style={styles.metaTexto}>{evento.local}</Text>
        </View>
        <View style={styles.meta}>
          <Feather
            name="users"
            size={13}
            color={
              equipeIncompleta(naEquipe.length, evento)
                ? colors.warning
                : colors.textMuted
            }
          />
          <Text
            style={[
              styles.metaTexto,
              equipeIncompleta(naEquipe.length, evento) && styles.metaAlerta,
            ]}
          >
            Equipe: {descreverEquipe(naEquipe.length, evento)}
          </Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Brigadistas escalados</Text>
        <Text style={styles.contagem}>{escalasDoDia.length}</Text>
      </View>

      {escalasDoDia.length ? (
        <Card style={styles.escalados}>
          {escalasDoDia.map((escala) => (
            <Escalado
              key={escala.id}
              escala={escala}
              removendo={removendoId === escala.id}
              onRemover={() => pedirRemocao(escala)}
            />
          ))}
        </Card>
      ) : (
        <Text style={styles.semEscalados}>
          Ninguém escalado ainda. Adicione brigadistas abaixo.
        </Text>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Adicionar brigadistas</Text>
        <Text style={styles.contagem}>
          {disponiveis} {disponiveis === 1 ? "disponível" : "disponíveis"}
        </Text>
      </View>
    </View>
  );

  const rodape = (
    <View style={styles.rodape}>
      {comPendencia.length ? (
        <Card style={styles.aviso}>
          <Feather name="alert-triangle" size={16} color={colors.warning} />
          <Text style={styles.avisoTexto}>
            {comPendencia.length === 1
              ? `${comPendencia[0].brigadista.nome} não tem todas as certificações exigidas. Você ainda pode escalar.`
              : `${comPendencia.length} selecionados não têm todas as certificações exigidas. Você ainda pode escalar.`}
          </Text>
        </Card>
      ) : null}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {candidatos.length ? (
        <Button
          title={
            selecionados.length > 1
              ? `Adicionar ${selecionados.length} à escala`
              : "Adicionar à escala"
          }
          rightIcon="user-plus"
          loading={salvando}
          onPress={adicionar}
        />
      ) : null}
      <Button title="Editar evento" variant="outline" onPress={editarEvento} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={candidatos}
        keyExtractor={(item) => item.brigadista.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={cabecalho}
        ListFooterComponent={rodape}
        ListEmptyComponent={
          <Text style={styles.semEscalados}>
            Todos os brigadistas ativos já estão nesta escala.
          </Text>
        }
        renderItem={({ item }) => (
          <CandidatoBrigadista
            candidato={item}
            marcado={selecionados.includes(item.brigadista.id)}
            onPress={() => alternar(item.brigadista.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
      />
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
  cabecalho: {
    gap: 14,
    marginBottom: 10,
  },
  resumo: {
    gap: 6,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  metaAlerta: {
    fontFamily: fonts.semibold,
    color: colors.warning,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  contagem: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  escalados: {
    gap: 12,
  },
  escalado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  escaladoNome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  escaladoOrigem: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  remover: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  removendo: {
    opacity: 0.4,
  },
  semEscalados: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  separador: {
    height: 8,
  },
  rodape: {
    gap: 12,
    marginTop: 16,
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningSoft,
  },
  avisoTexto: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.warning,
  },
  erro: {
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  vazio: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  vazioTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
});
