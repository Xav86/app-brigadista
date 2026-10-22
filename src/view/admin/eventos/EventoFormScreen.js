import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import TextField from "../../../components/TextField";
import { colors, fonts, radius, spacing } from "../../../theme";
import { formatDateBR, parseIsoDate } from "../../../utils/calendar";
import { descreverRecorrencia, isRecorrente } from "../../../utils/eventos";
import {
  mascararData,
  mascararHora,
  parseDataBR,
} from "../../../utils/formulario";
import { TIPOS_CERTIFICADOS_PADRAO } from "../gestao/useBrigadistas";
import { useAdminDados } from "../useAdminDados";
import {
  REGRA_SEM_RECORRENCIA,
  TAMANHO_MAXIMO_DESCRICAO,
  camposIniciais,
  validarFormularioEvento,
} from "./formularioEvento";

function Campo({ label, children, style }) {
  return (
    <View style={[styles.campo, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function EventoFormScreen({ navigation, route }) {
  const { buscarEvento, salvarEvento, excluirEvento } = useAdminDados();

  const eventoId = route.params?.eventoId;
  const existente = eventoId ? buscarEvento(eventoId) : null;

  const [campos, setCampos] = useState(() => camposIniciais(existente));
  const [erros, setErros] = useState({});

  // A tela de recorrência devolve a regra escolhida pelos params desta rota.
  const regraRecebida = route.params?.regraRecorrencia;
  useEffect(() => {
    if (regraRecebida) {
      setCampos((atuais) => ({ ...atuais, regra: regraRecebida }));
      setErros((atuais) => ({ ...atuais, regra: undefined }));
    }
  }, [regraRecebida]);

  function alterar(campo, valor) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  function alternarCertificacao(id) {
    alterar(
      "certificacoes",
      campos.certificacoes.includes(id)
        ? campos.certificacoes.filter((item) => item !== id)
        : [...campos.certificacoes, id],
    );
  }

  function abrirRecorrencia(regra = campos.regra) {
    const data = parseDataBR(campos.data);
    navigation.navigate("Recorrencia", {
      regra,
      dataInicio: data ? data.toISOString() : null,
    });
  }

  function alternarRecorrencia(ligar) {
    if (!ligar) {
      alterar("regra", REGRA_SEM_RECORRENCIA);
      return;
    }
    const data = parseDataBR(campos.data);
    const regraPadrao = {
      recorrencia: "semanal",
      diasSemana: data ? [data.getDay()] : [],
      terminaEm: null,
    };
    alterar("regra", regraPadrao);
    abrirRecorrencia(regraPadrao);
  }

  function resumoRecorrencia() {
    if (!isRecorrente(campos.regra)) return "Não se repete";
    const data = parseDataBR(campos.data) ?? new Date();
    const resumo = descreverRecorrencia({ ...campos.regra, dataInicio: data });
    if (!campos.regra.terminaEm) return resumo;
    return `${resumo} • até ${formatDateBR(parseIsoDate(campos.regra.terminaEm))}`;
  }

  function handleSalvar() {
    const resultado = validarFormularioEvento(campos, {
      editando: Boolean(existente),
    });
    setErros(resultado.erros);
    if (!resultado.evento) return;

    salvarEvento(existente?.id, resultado.evento);
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert(
      "Excluir evento",
      `Deseja excluir "${existente.nome}"? As escalas deste evento também serão removidas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            excluirEvento(existente.id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  const recorrente = isRecorrente(campos.regra);
  const qtdCertificacoes = campos.certificacoes.length;

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
          <ScreenHeader
            title={existente ? "Editar evento" : "Novo evento"}
            lead="Cadastre os dados e requisitos do evento."
            onBack={() => navigation.goBack()}
          />

          <Campo label="Nome">
            <TextField
              placeholder="Treinamento da Brigada"
              value={campos.nome}
              onChangeText={(texto) => alterar("nome", texto)}
              error={erros.nome}
            />
          </Campo>

          <Campo label="Descrição">
            <TextField
              placeholder="Detalhes que a equipe precisa saber"
              value={campos.descricao}
              onChangeText={(texto) => alterar("descricao", texto)}
              error={erros.descricao}
              multiline
              maxLength={TAMANHO_MAXIMO_DESCRICAO}
            />
            <Text style={styles.contador}>
              {campos.descricao.length}/{TAMANHO_MAXIMO_DESCRICAO}
            </Text>
          </Campo>

          <Campo label="Local">
            <TextField
              placeholder="Unidade Criciúma"
              value={campos.local}
              onChangeText={(texto) => alterar("local", texto)}
              error={erros.local}
            />
          </Campo>

          <Campo label="Data">
            <TextField
              icon="calendar"
              placeholder="DD/MM/AAAA"
              value={campos.data}
              onChangeText={(texto) => alterar("data", mascararData(texto))}
              error={erros.data}
              keyboardType="number-pad"
              maxLength={10}
            />
          </Campo>

          <View style={styles.linha}>
            <Campo label="Hora inicial" style={styles.flex}>
              <TextField
                icon="clock"
                placeholder="09:00"
                value={campos.horaInicio}
                onChangeText={(texto) =>
                  alterar("horaInicio", mascararHora(texto))
                }
                error={erros.horaInicio}
                keyboardType="number-pad"
                maxLength={5}
              />
            </Campo>
            <Campo label="Hora final" style={styles.flex}>
              <TextField
                icon="clock"
                placeholder="12:00"
                value={campos.horaFim}
                onChangeText={(texto) =>
                  alterar("horaFim", mascararHora(texto))
                }
                error={erros.horaFim}
                keyboardType="number-pad"
                maxLength={5}
              />
            </Campo>
          </View>

          <View>
            <Pressable
              onPress={() =>
                recorrente ? abrirRecorrencia() : alternarRecorrencia(true)
              }
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <Card
                  style={[
                    styles.recorrencia,
                    erros.regra && styles.cardErro,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.cardTitulo}>Evento recorrente</Text>
                    <Text style={styles.cardTexto}>{resumoRecorrencia()}</Text>
                  </View>
                  <Switch
                    value={recorrente}
                    onValueChange={alternarRecorrencia}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    accessibilityLabel="Evento recorrente"
                  />
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={colors.textMuted}
                  />
                </Card>
              )}
            </Pressable>
            {erros.regra ? (
              <Text style={styles.erro}>{erros.regra}</Text>
            ) : null}
          </View>

          <Card style={styles.certificacoes}>
            <View style={styles.certificacoesTopo}>
              <Text style={styles.cardTitulo}>Certificações necessárias</Text>
              <Text style={styles.cardTexto}>
                {qtdCertificacoes}{" "}
                {qtdCertificacoes === 1 ? "selecionada" : "selecionadas"}
              </Text>
            </View>
            <Text style={styles.cardTexto}>
              Selecione uma ou mais certificações.
            </Text>
            <View style={styles.chips}>
              {TIPOS_CERTIFICADOS_PADRAO.map((tipo) => {
                const marcada = campos.certificacoes.includes(tipo.id);
                return (
                  <Pressable
                    key={tipo.id}
                    onPress={() => alternarCertificacao(tipo.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: marcada }}
                    style={[styles.chip, marcada && styles.chipMarcado]}
                  >
                    {marcada ? (
                      <Feather name="check" size={12} color={colors.primary} />
                    ) : null}
                    <Text
                      style={[
                        styles.chipTexto,
                        marcada && styles.chipTextoMarcado,
                      ]}
                    >
                      {tipo.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <View style={styles.acoes}>
            <Button
              title={existente ? "Salvar alterações" : "Criar evento"}
              onPress={handleSalvar}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
            {existente ? (
              <Pressable
                onPress={handleExcluir}
                style={styles.excluir}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Feather name="trash-2" size={15} color={colors.primary} />
                <Text style={styles.excluirTexto}>Excluir evento</Text>
              </Pressable>
            ) : null}
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
    gap: 14,
  },
  campo: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  contador: {
    alignSelf: "flex-end",
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  linha: {
    flexDirection: "row",
    gap: 10,
  },
  recorrencia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardErro: {
    borderColor: colors.primary,
  },
  pressed: {
    backgroundColor: colors.primaryTint,
  },
  cardTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  cardTexto: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  erro: {
    marginTop: 6,
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  certificacoes: {
    gap: 6,
  },
  certificacoesTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
  },
  chipMarcado: {
    backgroundColor: colors.primarySoft,
  },
  chipTexto: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextoMarcado: {
    color: colors.primary,
  },
  acoes: {
    gap: 10,
    marginTop: 4,
  },
  excluir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  excluirTexto: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
});
