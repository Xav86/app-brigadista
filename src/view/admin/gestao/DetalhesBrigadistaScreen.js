import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import EventCard from "../../../components/EventCard";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../../theme";
import { ESPECIALIDADES_LABELS, useBrigadistas } from "./useBrigadistas";

const ESCALAS_PADRAO = [
  {
    id: "e1",
    dia: "12",
    mes: "OUT",
    titulo: "Treinamento da Brigada",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    statusLabel: "Confirmado",
    statusTone: "success",
  },
  {
    id: "e2",
    dia: "05",
    mes: "NOV",
    titulo: "Simulado de Emergência",
    horario: "08:00 - 12:00",
    local: "Centro de Treinamento",
    statusLabel: "Pendente",
    statusTone: "warning",
  },
];

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
              <View style={styles.avatarDot} />
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
                <StatusPill label="Ativo" tone="success" />
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
          <View style={styles.secaoLista}>
            {ESCALAS_PADRAO.map((escala) => (
              <EventCard
                key={escala.id}
                dia={escala.dia}
                mes={escala.mes}
                titulo={escala.titulo}
                horario={escala.horario}
                local={escala.local}
                statusLabel={escala.statusLabel}
                statusTone={escala.statusTone}
              />
            ))}
          </View>
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
            title="Desativar usuário"
            variant="soft"
            onPress={() =>
              Alert.alert(
                "Em breve",
                "A desativação de conta será integrada ao controle de acesso.",
              )
            }
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
