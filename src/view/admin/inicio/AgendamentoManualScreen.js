import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import OptionsSheet from "../../../components/OptionsSheet";
import ScreenHeader from "../../../components/ScreenHeader";
import { colors, fonts, radius, spacing } from "../../../theme";
import {
  formatCompactDate,
  formatDateBR,
  getWeekdayLabel,
  parseIsoDate,
  toIsoDate,
} from "../../../utils/calendar";
import {
  formatarHorario,
  gerarOcorrencias,
  proximaOcorrencia,
} from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";
import { montarCandidatos } from "./agendamento";

const QTD_DATAS_RECORRENTES = 8;

function Seletor({ icon, label, valor, placeholder, onPress, erro, style }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={[styles.seletor, erro && styles.seletorErro, style]}
    >
      <View style={styles.seletorIcone}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.seletorLabel}>{label}</Text>
        <Text
          style={valor ? styles.seletorValor : styles.seletorPlaceholder}
          numberOfLines={1}
        >
          {valor ?? placeholder}
        </Text>
      </View>
      {onPress ? (
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      ) : null}
    </Wrapper>
  );
}

function Candidato({ candidato, marcado, onPress }) {
  const { brigadista, jaEscalado, disponivel, pendencias } = candidato;
  const certificacoes = brigadista.certificados
    .map((item) => item.nomeCertificado)
    .join(" • ");

  return (
    <Pressable
      onPress={onPress}
      disabled={jaEscalado}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado, disabled: jaEscalado }}
      style={[
        styles.candidato,
        marcado && styles.candidatoMarcado,
        jaEscalado && styles.candidatoDesabilitado,
      ]}
    >
      <View style={[styles.checkbox, marcado && styles.checkboxMarcado]}>
        {marcado ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
      </View>
      <View style={styles.flex}>
        <Text style={styles.candidatoNome}>{brigadista.nome}</Text>
        <Text style={styles.candidatoCert} numberOfLines={1}>
          {certificacoes || "Sem certificações"}
        </Text>
        {pendencias.length && !jaEscalado ? (
          <Text style={styles.candidatoAlerta} numberOfLines={2}>
            Falta: {pendencias.join(", ")}
          </Text>
        ) : null}
      </View>
      {jaEscalado ? (
        <Text style={styles.tagNeutra}>Já escalado</Text>
      ) : disponivel ? (
        <Text style={styles.tagDisponivel}>Disponível</Text>
      ) : null}
    </Pressable>
  );
}

export default function AgendamentoManualScreen({ navigation, route }) {
  const { eventos, brigadistas, escalas, solicitacoes, adicionarEscalas } =
    useAdminDados();

  const agora = new Date();
  const eventosAtivos = eventos
    .map((evento) => ({ evento, proxima: proximaOcorrencia(evento, agora) }))
    .filter(({ proxima }) => proxima)
    .sort((a, b) => a.proxima - b.proxima);

  const eventoInicial = eventosAtivos.find(
    ({ evento }) => evento.id === route.params?.eventoId,
  );

  const [eventoId, setEventoId] = useState(eventoInicial?.evento.id ?? null);
  const [dataIso, setDataIso] = useState(
    eventoInicial ? toIsoDate(eventoInicial.proxima) : null,
  );
  const [selecionados, setSelecionados] = useState([]);
  const [seletorAberto, setSeletorAberto] = useState(null);
  const [erros, setErros] = useState({});

  const evento = eventos.find((item) => item.id === eventoId) ?? null;
  const datas = evento
    ? gerarOcorrencias(evento, {
        aPartirDe: agora,
        quantidade: QTD_DATAS_RECORRENTES,
      })
    : [];

  const candidatos =
    evento && dataIso
      ? montarCandidatos({
          brigadistas,
          escalas,
          solicitacoes,
          evento,
          dataIso,
        })
      : [];
  const disponiveis = candidatos.filter(
    (item) => item.disponivel && !item.jaEscalado,
  ).length;
  const comPendencia = candidatos.filter(
    (item) =>
      selecionados.includes(item.brigadista.id) && item.pendencias.length,
  );

  function escolherEvento(id) {
    const escolhido = eventos.find((item) => item.id === id);
    setEventoId(id);
    setDataIso(toIsoDate(proximaOcorrencia(escolhido, agora)));
    setSelecionados([]);
    setErros({});
  }

  function escolherData(iso) {
    setDataIso(iso);
    setSelecionados([]);
    setErros((atuais) => ({ ...atuais, data: undefined }));
  }

  function alternar(brigadistaId) {
    setErros((atuais) => ({ ...atuais, brigadistas: undefined }));
    setSelecionados((atuais) =>
      atuais.includes(brigadistaId)
        ? atuais.filter((id) => id !== brigadistaId)
        : [...atuais, brigadistaId],
    );
  }

  function handleConfirmar() {
    const proximos = {};
    if (!evento) proximos.evento = "Selecione um evento para continuar";
    else if (!dataIso) proximos.data = "Escolha a data";
    else if (selecionados.length === 0) {
      proximos.brigadistas = "Selecione pelo menos um brigadista";
    }
    setErros(proximos);
    if (Object.keys(proximos).length) return;

    adicionarEscalas(evento.id, dataIso, selecionados);
    navigation.goBack();
  }

  const dataSelecionada = dataIso ? parseIsoDate(dataIso) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Agendamento manual"
          lead="Crie uma escala diretamente para um evento."
          onBack={() => navigation.goBack()}
        />

        <View>
          <Seletor
            icon="calendar"
            label="Evento"
            valor={evento?.nome}
            placeholder="Escolha um evento"
            onPress={() => setSeletorAberto("evento")}
            erro={erros.evento}
          />
          {erros.evento ? (
            <Text style={styles.erro}>{erros.evento}</Text>
          ) : null}
        </View>

        <View style={styles.linha}>
          <Seletor
            icon="calendar"
            label="Data"
            valor={dataSelecionada ? formatCompactDate(dataSelecionada) : null}
            placeholder="—"
            onPress={evento ? () => setSeletorAberto("data") : undefined}
            erro={erros.data}
            style={styles.flex}
          />
          <Seletor
            icon="clock"
            label="Horário"
            valor={evento ? formatarHorario(evento) : null}
            placeholder="—"
            style={styles.flex}
          />
        </View>

        {evento ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selecionar brigadistas</Text>
              <Text style={styles.contagem}>
                {disponiveis} {disponiveis === 1 ? "disponível" : "disponíveis"}
              </Text>
            </View>

            <View style={styles.lista}>
              {candidatos.map((candidato) => (
                <Candidato
                  key={candidato.brigadista.id}
                  candidato={candidato}
                  marcado={selecionados.includes(candidato.brigadista.id)}
                  onPress={() => alternar(candidato.brigadista.id)}
                />
              ))}
            </View>

            {selecionados.length ? (
              <View style={styles.resumo}>
                <Feather name="users" size={14} color={colors.primary} />
                <Text style={styles.resumoTexto}>
                  {selecionados.length}{" "}
                  {selecionados.length === 1
                    ? "brigadista selecionado"
                    : "brigadistas selecionados"}
                </Text>
              </View>
            ) : null}

            {comPendencia.length ? (
              <Card style={styles.aviso}>
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.warning}
                />
                <Text style={styles.avisoTexto}>
                  {comPendencia.length === 1
                    ? `${comPendencia[0].brigadista.nome} não tem todas as certificações exigidas. Você ainda pode escalar.`
                    : `${comPendencia.length} selecionados não têm todas as certificações exigidas. Você ainda pode escalar.`}
                </Text>
              </Card>
            ) : null}

            {erros.brigadistas ? (
              <Text style={styles.erro}>{erros.brigadistas}</Text>
            ) : null}
          </>
        ) : (
          <View style={styles.vazio}>
            <Feather name="users" size={28} color={colors.textFaint} />
            <Text style={styles.vazioTexto}>
              Escolha um evento para ver os brigadistas.
            </Text>
          </View>
        )}

        <Button
          title="Confirmar escala"
          rightIcon="check"
          onPress={handleConfirmar}
          style={styles.confirmar}
        />
      </ScrollView>

      <OptionsSheet
        visible={seletorAberto === "evento"}
        title="Escolha o evento"
        valor={eventoId}
        opcoes={eventosAtivos.map(({ evento: item, proxima }) => ({
          value: item.id,
          label: item.nome,
          descricao: `${formatDateBR(proxima)} • ${item.local}`,
        }))}
        vazio="Nenhum evento agendado."
        onSelect={escolherEvento}
        onClose={() => setSeletorAberto(null)}
      />
      <OptionsSheet
        visible={seletorAberto === "data"}
        title="Escolha a data"
        valor={dataIso}
        opcoes={datas.map((data) => ({
          value: toIsoDate(data),
          label: formatDateBR(data),
          descricao: getWeekdayLabel(data),
        }))}
        onSelect={escolherData}
        onClose={() => setSeletorAberto(null)}
      />
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
  linha: {
    flexDirection: "row",
    gap: 10,
  },
  seletor: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  seletorErro: {
    borderColor: colors.primary,
  },
  seletorIcone: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  seletorLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  seletorValor: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  seletorPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textFaint,
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
  lista: {
    gap: 8,
  },
  candidato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  candidatoMarcado: {
    backgroundColor: colors.primaryTint,
  },
  candidatoDesabilitado: {
    opacity: 0.55,
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
  candidatoNome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  candidatoCert: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  candidatoAlerta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.warning,
  },
  tagDisponivel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.success,
  },
  tagNeutra: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textMuted,
  },
  resumo: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  resumoTexto: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
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
    marginTop: 6,
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
  },
  confirmar: {
    marginTop: 4,
  },
});
