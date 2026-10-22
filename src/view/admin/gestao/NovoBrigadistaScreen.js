import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import TextField from "../../../components/TextField";
import {
  VALORES_ESPECIALIDADE,
  VALORES_SEXO,
  VALORES_TIPO_USUARIO,
} from "../../../models";
import { colors, fonts, radius, spacing } from "../../../theme";
import { ESPECIALIDADES_LABELS, useBrigadistas } from "./useBrigadistas";

const SEXOS_LABELS = {
  M: "Masculino (M)",
  F: "Feminino (F)",
  Outro: "Outro",
};

const TIPOS_USUARIO_LABELS = {
  user: "Brigadista",
  admin: "Administrador",
};

function normalizarDataIso(valor = "") {
  const limpo = valor.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    return limpo;
  }
  const brMatch = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dia, mes, ano] = brMatch;
    return `${ano}-${mes}-${dia}`;
  }
  return limpo;
}

function hojeIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function somarMesesIso(dataIso, meses = 12) {
  const match = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const base = match
    ? new Date(Number(match[1]), Number(match[2]) - 1 + meses, Number(match[3]))
    : new Date(Date.now() + meses * 30 * 86400000);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NovoBrigadistaScreen({ navigation, route }) {
  const {
    brigadistas,
    tiposCertificados,
    adicionarBrigadista,
    atualizarBrigadista,
  } = useBrigadistas();

  const brigadistaId = route?.params?.brigadistaId;
  const existente = brigadistas.find((b) => b.id === brigadistaId);

  const [nome, setNome] = useState(existente?.nome ?? "");
  const [email, setEmail] = useState(existente?.email ?? "");
  const [cpf, setCpf] = useState(existente?.cpf ?? "");
  const [dataNascimento, setDataNascimento] = useState(
    existente?.dataNascimento ?? "",
  );
  const [sexo, setSexo] = useState(existente?.sexo ?? "M");
  const [tipoUsuario, setTipoUsuario] = useState(
    existente?.tipoUsuario ?? "user",
  );
  const [isProfissional, setIsProfissional] = useState(
    existente?.isProfissional ?? false,
  );
  const [especialidade, setEspecialidade] = useState(
    existente?.especialidade ?? "nenhum",
  );

  // Certificações selecionadas e metadados do CertificadoBrigadista
  const idsIniciais = existente?.certificados
    ? existente.certificados.map((c) => c.tipoCertificadoId)
    : tiposCertificados.slice(0, 2).map((t) => t.id);

  const [certificadosSelecionadosIds, setCertificadosSelecionadosIds] =
    useState(idsIniciais);
  const [emissorPadrao, setEmissorPadrao] = useState(
    existente?.certificados?.[0]?.emissor ?? "Corpo de Bombeiros",
  );
  const [dataEmissaoPadrao, setDataEmissaoPadrao] = useState(
    existente?.certificados?.[0]?.dataEmissao ?? hojeIso(),
  );
  const [dataValidadePadrao, setDataValidadePadrao] = useState(
    existente?.certificados?.[0]?.dataValidade ?? somarMesesIso(hojeIso(), 12),
  );

  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);

  function alternarCertificado(tipoId) {
    setCertificadosSelecionadosIds((atuais) =>
      atuais.includes(tipoId)
        ? atuais.filter((id) => id !== tipoId)
        : [...atuais, tipoId],
    );
  }

  function alternarSexo() {
    const idx = VALORES_SEXO.indexOf(sexo);
    setSexo(VALORES_SEXO[(idx + 1) % VALORES_SEXO.length]);
  }

  function alternarTipoUsuario() {
    const idx = VALORES_TIPO_USUARIO.indexOf(tipoUsuario);
    setTipoUsuario(
      VALORES_TIPO_USUARIO[(idx + 1) % VALORES_TIPO_USUARIO.length],
    );
  }

  function alternarProfissional() {
    setIsProfissional((atual) => !atual);
  }

  function alternarEspecialidade() {
    const idx = VALORES_ESPECIALIDADE.indexOf(especialidade);
    setEspecialidade(
      VALORES_ESPECIALIDADE[(idx + 1) % VALORES_ESPECIALIDADE.length],
    );
  }

  async function handleSalvar() {
    const nextErrors = {};
    const dataNascIso = normalizarDataIso(dataNascimento);
    const emissaoIso = normalizarDataIso(dataEmissaoPadrao);
    const validadeIso = normalizarDataIso(dataValidadePadrao);

    if (!nome.trim()) nextErrors.nome = "Informe o nome completo";
    if (!email.trim()) nextErrors.email = "Informe o e-mail";
    if (!cpf.trim()) nextErrors.cpf = "Informe o CPF";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascIso)) {
      nextErrors.dataNascimento =
        "Use o formato AAAA-MM-DD ou DD/MM/AAAA (ex: 1995-08-20)";
    }
    if (certificadosSelecionadosIds.length > 0) {
      if (!emissorPadrao.trim()) {
        nextErrors.emissor = "Informe o órgão emissor dos certificados";
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(emissaoIso)) {
        nextErrors.dataEmissao = "Formato inválido (use AAAA-MM-DD)";
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(validadeIso)) {
        nextErrors.dataValidade = "Formato inválido (use AAAA-MM-DD)";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const certificados = certificadosSelecionadosIds.map((id) => {
      const tipo = tiposCertificados.find((t) => t.id === id);
      const certExistente = existente?.certificados?.find(
        (c) => c.tipoCertificadoId === id,
      );
      return {
        tipoCertificadoId: id,
        nomeCertificado:
          tipo?.nome ?? certExistente?.nomeCertificado ?? String(id),
        emissor: emissorPadrao.trim(),
        dataEmissao: emissaoIso,
        dataValidade: validadeIso,
      };
    });

    const dadosUsuario = {
      nome: nome.trim(),
      email: email.trim(),
      tipoUsuario,
      cpf: cpf.trim(),
      dataNascimento: dataNascIso,
      sexo,
      isProfissional,
      especialidade,
      fcmTokens: existente?.fcmTokens ?? [],
      certificados,
      criadoEm: existente?.criadoEm ?? new Date(),
    };

    try {
      setSalvando(true);
      if (existente) {
        await atualizarBrigadista(existente.id, dadosUsuario);
      } else {
        await adicionarBrigadista(dadosUsuario);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Erro ao salvar no Firebase",
        err?.message || "Verifique os dados preenchidos e tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBlock}>
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
              <Text style={styles.title}>
                {existente ? "Editar brigadista" : "Novo brigadista"}
              </Text>
            </View>
            <Text style={styles.lead}>
              Cadastre os dados e certificações do brigadista.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextField
                placeholder="João Silva"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  if (errors.nome) {
                    setErrors((e) => ({ ...e, nome: undefined }));
                  }
                }}
                error={errors.nome}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextField
                placeholder="joao.silva@brigada.com.br"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) {
                    setErrors((e) => ({ ...e, email: undefined }));
                  }
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextField
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={(t) => {
                  setCpf(t);
                  if (errors.cpf) {
                    setErrors((e) => ({ ...e, cpf: undefined }));
                  }
                }}
                error={errors.cpf}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Data de nascimento (AAAA-MM-DD)</Text>
              <TextField
                placeholder="1995-08-20"
                value={dataNascimento}
                onChangeText={(t) => {
                  setDataNascimento(t);
                  if (errors.dataNascimento) {
                    setErrors((e) => ({ ...e, dataNascimento: undefined }));
                  }
                }}
                error={errors.dataNascimento}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.rowSelectors}>
              <View style={[styles.fieldGroup, styles.colHalf]}>
                <Text style={styles.label}>Sexo</Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={alternarSexo}
                  accessibilityRole="button"
                >
                  <Text style={styles.selectText} numberOfLines={1}>
                    {SEXOS_LABELS[sexo]}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>

              <View style={[styles.fieldGroup, styles.colHalf]}>
                <Text style={styles.label}>Tipo de usuário</Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={alternarTipoUsuario}
                  accessibilityRole="button"
                >
                  <Text style={styles.selectText} numberOfLines={1}>
                    {TIPOS_USUARIO_LABELS[tipoUsuario]}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.rowSelectors}>
              <View style={[styles.fieldGroup, styles.statusCol]}>
                <Text style={styles.label}>Profissional</Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={alternarProfissional}
                  accessibilityRole="button"
                >
                  <Text style={styles.selectText}>
                    {isProfissional ? "Sim" : "Não"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>

              <View style={[styles.fieldGroup, styles.unidadeCol]}>
                <Text style={styles.label}>Especialidade</Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={alternarEspecialidade}
                  accessibilityRole="button"
                >
                  <Text style={styles.selectText} numberOfLines={1}>
                    {ESPECIALIDADES_LABELS[especialidade]}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <Card style={styles.certCard}>
              <View style={styles.certHeader}>
                <Text style={styles.certTitle}>Certificações</Text>
                <Text style={styles.certCounter}>
                  {certificadosSelecionadosIds.length}{" "}
                  {certificadosSelecionadosIds.length === 1
                    ? "selecionada"
                    : "selecionadas"}
                </Text>
              </View>
              <Text style={styles.certLead}>
                Selecione uma ou mais certificações.
              </Text>

              <View style={styles.checkboxList}>
                {tiposCertificados.map((tipo) => {
                  const marcada = certificadosSelecionadosIds.includes(tipo.id);
                  return (
                    <Pressable
                      key={tipo.id}
                      style={styles.checkboxRow}
                      onPress={() => alternarCertificado(tipo.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: marcada }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          marcada && styles.checkboxChecked,
                        ]}
                      >
                        {marcada ? (
                          <Feather name="check" size={13} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={styles.checkboxLabel}>{tipo.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {certificadosSelecionadosIds.length > 0 ? (
                <>
                  <View style={styles.tagsRow}>
                    {certificadosSelecionadosIds.map((id) => {
                      const tipo = tiposCertificados.find((t) => t.id === id);
                      const label = tipo?.nome ?? id;
                      return (
                        <Pressable
                          key={id}
                          style={styles.tagPill}
                          onPress={() => alternarCertificado(id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${label}`}
                        >
                          <Text style={styles.tagText}>{label}</Text>
                          <Feather name="x" size={12} color={colors.primary} />
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.certMetaInputs}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Órgão emissor</Text>
                      <TextField
                        placeholder="Corpo de Bombeiros"
                        value={emissorPadrao}
                        onChangeText={(t) => {
                          setEmissorPadrao(t);
                          if (errors.emissor) {
                            setErrors((e) => ({ ...e, emissor: undefined }));
                          }
                        }}
                        error={errors.emissor}
                      />
                    </View>

                    <View style={styles.rowSelectors}>
                      <View style={[styles.fieldGroup, styles.colHalf]}>
                        <Text style={styles.label}>Emissão (AAAA-MM-DD)</Text>
                        <TextField
                          placeholder="2026-10-22"
                          value={dataEmissaoPadrao}
                          onChangeText={(t) => {
                            setDataEmissaoPadrao(t);
                            if (errors.dataEmissao) {
                              setErrors((e) => ({
                                ...e,
                                dataEmissao: undefined,
                              }));
                            }
                          }}
                          error={errors.dataEmissao}
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={[styles.fieldGroup, styles.colHalf]}>
                        <Text style={styles.label}>Validade (AAAA-MM-DD)</Text>
                        <TextField
                          placeholder="2027-10-22"
                          value={dataValidadePadrao}
                          onChangeText={(t) => {
                            setDataValidadePadrao(t);
                            if (errors.dataValidade) {
                              setErrors((e) => ({
                                ...e,
                                dataValidade: undefined,
                              }));
                            }
                          }}
                          error={errors.dataValidade}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </View>
                </>
              ) : null}
            </Card>
          </View>

          <View style={styles.acoes}>
            <Button
              title="Salvar brigadista"
              onPress={handleSalvar}
              loading={salvando}
            />
            <Button
              title="Cancelar"
              variant="outline"
              disabled={salvando}
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 16,
  },
  headerBlock: {
    gap: 8,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  form: {
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  rowSelectors: {
    flexDirection: "row",
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },
  statusCol: {
    flex: 0.42,
  },
  unidadeCol: {
    flex: 0.58,
  },
  selectBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  selectText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  certCard: {
    gap: 10,
    marginTop: 2,
  },
  certHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  certTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  certCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  certLead: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  checkboxList: {
    gap: 10,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  tagText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  certMetaInputs: {
    gap: 10,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  acoes: {
    gap: 10,
    marginTop: 4,
  },
});
