import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
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
import EventCard from "../../../components/EventCard";
import StatusPill from "../../../components/StatusPill";
import { alterarAtivoUsuario } from "../../../services/firestore";
import { colors, fonts, radius, spacing } from "../../../theme";
import { formatShortDate, formatTime, startOfDay } from "../../../utils/calendar";
import { useAdminDados } from "../useAdminDados";
import { ESPECIALIDADES_LABELS, useBrigadistas } from "./useBrigadistas";
import FotoCertificado from "./FotoCertificado";

const STATUS_ESCALA = {
  confirmado: { label: "Confirmado", tone: "success" },
  pendente: { label: "Pendente", tone: "warning" },
  proposto: { label: "Proposto", tone: "neutral" },
  recusado: { label: "Recusado", tone: "primary" },
};

// Alert.alert com botões não funciona no Expo Web, então lá usamos o confirm do navegador.
function confirmar(titulo, mensagem, textoBotao, aoConfirmar) {
  if (Platform.OS === "web") {
    if (window.confirm(`${titulo}\n${mensagem}`)) aoConfirmar();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: "Cancelar", style: "cancel" },
    { text: textoBotao, style: "destructive", onPress: aoConfirmar },
  ]);
}

function avisar(titulo, mensagem) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

function formatarIsoParaBr(iso = "") {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function avaliarValidade(dataValidadeIso = "") {
  const m = dataValidadeIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    return { situacao: "valida", statusLabel: "Válida", aviso: null };
  }
  const validade = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const hoje = new Date();
  const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / 86400000);

  if (diffDias < 0) {
    return {
      situacao: "vencendo",
      statusLabel: "Vencida",
      aviso: `Certificação venceu em ${formatarIsoParaBr(dataValidadeIso)}.`,
    };
  }
  if (diffDias <= 30) {
    return {
      situacao: "vencendo",
      statusLabel: `Vence em ${diffDias} dias`,
      aviso: `Providencie a renovação até ${formatarIsoParaBr(dataValidadeIso)}.`,
    };
  }
  return { situacao: "valida", statusLabel: "Válida", aviso: null };
}

export default function DetalhesBrigadistaScreen({ navigation, route }) {
  const { brigadistas } = useBrigadistas();
  const { escalasDoBrigadista } = useAdminDados();
  const [salvando, setSalvando] = useState(false);
  const brigadistaId = route?.params?.brigadistaId;
  const brigadista = brigadistas.find((b) => b.id === brigadistaId);

  if (!brigadista) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable
              style={styles.voltar}
              onPress={() => navigation.goBack()}
              hitSlop={8}
            >
              <Feather name="arrow-left" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Detalhes do brigadista</Text>
          </View>
          <Text style={styles.vazio}>Brigadista não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const certificados = brigadista.certificados ?? [];
  const ativo = brigadista.ativo !== false;

  const hoje = startOfDay(new Date());
  const proximasEscalas = escalasDoBrigadista(brigadista.id).filter(
    (escala) => escala.dataHoraServico >= hoje && escala.status !== "recusado",
  );

  async function gravarAtivo(novoValor) {
    try {
      setSalvando(true);
      await alterarAtivoUsuario(brigadista.id, novoValor);
    } catch (erro) {
      avisar("Não foi possível salvar", erro.message);
    } finally {
      setSalvando(false);
    }
  }

  function handleAlternarAtivo() {
    if (ativo) {
      confirmar(
        "Inativar usuário",
        `${brigadista.nome} não vai mais conseguir entrar no app nem ser escalado. Deseja continuar?`,
        "Inativar",
        () => gravarAtivo(false),
      );
      return;
    }
    gravarAtivo(true);
  }
  const especialidadeLabel =
    ESPECIALIDADES_LABELS[brigadista.especialidade] || "Nenhuma";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.voltar}
            onPress={() => navigation.goBack()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={16} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Detalhes do brigadista</Text>
        </View>

        <Card style={styles.perfilCard}>
          <View style={styles.perfilTopo}>
            <View style={styles.avatar}>
              {brigadista.fotoUrl ? (
                <Image
                  source={{ uri: brigadista.fotoUrl }}
                  style={styles.avatarFoto}
                />
              ) : (
                <View style={styles.avatarDot} />
              )}
            </View>
            <View style={styles.perfilInfo}>
              <Text style={styles.nome}>{brigadista.nome}</Text>
              <View style={styles.pillsRow}>
                <StatusPill
                  label={
                    brigadista.tipoUsuario === "admin"
                      ? "Administrador"
                      : "Brigadista"
                  }
                  tone="neutral"
                />
                <StatusPill
                  label={ativo ? "Ativo" : "Inativo"}
                  tone={ativo ? "success" : "neutral"}
                />
              </View>
            </View>
          </View>

          <View style={styles.dadosLista}>
            <Text style={styles.dadoLinha}>
              E-mail  •  {brigadista.email}
            </Text>
            <Text style={styles.dadoLinha}>
              CPF  •  {brigadista.cpf}
            </Text>
            <Text style={styles.dadoLinha}>
              Nascimento  •  {formatarIsoParaBr(brigadista.dataNascimento)}  •  Sexo:{" "}
              {brigadista.sexo}
            </Text>
            <Text style={styles.dadoLinha}>
              Tipo sanguíneo  •  {brigadista.tipoSanguineo || "Não informado"}
            </Text>
            <Text style={styles.dadoLinha}>
              {brigadista.isProfissional ? "Profissional" : "Voluntário"}  •  Especialidade:{" "}
              {especialidadeLabel}
            </Text>
          </View>
        </Card>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Certificações</Text>
          {certificados.length ? (
            <View style={styles.secaoLista}>
              {certificados.map((cert, idx) => {
                const avaliacao = avaliarValidade(cert.dataValidade);
                const vencendo = avaliacao.situacao === "vencendo";
                return (
                  <Card
                    key={`${cert.tipoCertificadoId}-${idx}`}
                    style={[
                      styles.certCard,
                      vencendo && styles.certCardWarning,
                    ]}
                  >
                    <View style={styles.certRow}>
                      <View style={styles.certTextos}>
                        <Text style={styles.certNome}>
                          {cert.nomeCertificado}
                        </Text>
                        <Text style={styles.certValidade}>
                          Emissor: {cert.emissor} • Validade:{" "}
                          {formatarIsoParaBr(cert.dataValidade)}
                        </Text>
                      </View>
                      {vencendo ? (
                        <Text style={styles.certVencendoLabel}>
                          {avaliacao.statusLabel}
                        </Text>
                      ) : (
                        <StatusPill
                          label={avaliacao.statusLabel}
                          tone="success"
                        />
                      )}
                    </View>
                    {avaliacao.aviso ? (
                      <Text style={styles.certAviso}>{avaliacao.aviso}</Text>
                    ) : null}

                    <FotoCertificado
                      uri={brigadista.fotosCertificados?.[cert.tipoCertificadoId]}
                    />
                  </Card>
                );
              })}
            </View>
          ) : (
            <Text style={styles.vazio}>Nenhuma certificação cadastrada.</Text>
          )}
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Próximas escalas</Text>
          {proximasEscalas.length ? (
            <View style={styles.secaoLista}>
              {proximasEscalas.map((escala) => {
                const [dia, mes] = formatShortDate(escala.dataHoraServico).split(" ");
                const status = STATUS_ESCALA[escala.status];
                return (
                  <EventCard
                    key={escala.id}
                    dia={dia}
                    mes={mes}
                    titulo={escala.eventoNome}
                    horario={formatTime(escala.dataHoraServico)}
                    local={escala.eventoLocal}
                    statusLabel={status?.label}
                    statusTone={status?.tone}
                  />
                );
              })}
            </View>
          ) : (
            <Text style={styles.vazio}>Nenhuma escala marcada.</Text>
          )}
        </View>

        <View style={styles.acoes}>
          <Button
            title="Editar brigadista"
            onPress={() =>
              navigation.navigate("NovoBrigadista", {
                brigadistaId: brigadista.id,
              })
            }
          />
          <Button
            title={ativo ? "Inativar usuário" : "Reativar usuário"}
            variant="soft"
            loading={salvando}
            onPress={handleAlternarAtivo}
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
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  voltar: {
    width: 32,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  perfilCard: {
    gap: 14,
    padding: 16,
  },
  perfilTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  perfilInfo: {
    flex: 1,
    gap: 6,
  },
  nome: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dadosLista: {
    gap: 8,
  },
  dadoLinha: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  secao: {
    gap: 10,
  },
  secaoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  secaoLista: {
    gap: 10,
  },
  certCard: {
    gap: 6,
    borderRadius: radius.md,
  },
  certCardWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: "#F5E1A4",
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  certTextos: {
    flex: 1,
    gap: 2,
  },
  certNome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  certValidade: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  certVencendoLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.warning,
  },
  certAviso: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warning,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  acoes: {
    gap: 10,
    marginTop: 4,
  },
});
