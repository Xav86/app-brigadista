import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import TextField from "../../../components/TextField";
import { colors, fonts, radius, spacing } from "../../../theme";
import {
  DIAS_SEMANA_CURTOS,
  formatDateBR,
  formatFullDate,
  getWeekdayLabel,
  getWeekdayName,
  parseIsoDate,
  toIsoDate,
} from "../../../utils/calendar";
import { RECORRENCIA_LABELS, gerarOcorrencias } from "../../../utils/eventos";
import { mascararData, parseDataBR } from "../../../utils/formulario";

const OPCOES_PRINCIPAIS = ["nenhuma", "diario", "semanal", "mensal"];
const OPCOES_PERSONALIZADAS = ["trimestral", "semestral", "anual"];
const QTD_PREVIA = 4;

function Radio({ label, selecionado, onPress, direita, destaque = true }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: selecionado }}
      style={[
        styles.opcao,
        selecionado && destaque && styles.opcaoSelecionada,
        !destaque && styles.opcaoSimples,
      ]}
    >
      <View style={[styles.radio, selecionado && styles.radioSelecionado]}>
        {selecionado ? <View style={styles.radioPonto} /> : null}
      </View>
      <Text
        style={[
          styles.opcaoTexto,
          selecionado && destaque && styles.opcaoTextoSelecionado,
        ]}
      >
        {label}
      </Text>
      {direita}
    </Pressable>
  );
}

function descreverDias(diasSemana) {
  const nomes = [...diasSemana]
    .sort((a, b) => a - b)
    .map((dia) => getWeekdayName(dia).toLowerCase());
  if (nomes.length === 0) return "Escolha pelo menos um dia.";
  if (nomes.length === 7) return "O evento se repete todos os dias da semana.";
  const lista =
    nomes.length === 1
      ? nomes[0]
      : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
  return `O evento se repete toda semana: ${lista}.`;
}

export default function RecorrenciaScreen({ navigation, route }) {
  const { regra, dataInicio: dataInicioIso } = route.params;
  const dataInicio = dataInicioIso ? new Date(dataInicioIso) : null;

  const [recorrencia, setRecorrencia] = useState(regra.recorrencia);
  const [diasSemana, setDiasSemana] = useState(regra.diasSemana);
  const [personalizado, setPersonalizado] = useState(
    OPCOES_PERSONALIZADAS.includes(regra.recorrencia),
  );
  const [termina, setTermina] = useState(regra.terminaEm ? "data" : "nunca");
  const [dataFim, setDataFim] = useState(
    regra.terminaEm ? formatDateBR(parseIsoDate(regra.terminaEm)) : "",
  );
  const [erros, setErros] = useState({});

  function escolher(valor) {
    setRecorrencia(valor);
    setErros({});
    if (valor === "semanal" && diasSemana.length === 0 && dataInicio) {
      setDiasSemana([dataInicio.getDay()]);
    }
  }

  function alternarDia(dia) {
    setErros((atuais) => ({ ...atuais, dias: undefined }));
    setDiasSemana((atuais) =>
      atuais.includes(dia)
        ? atuais.filter((item) => item !== dia)
        : [...atuais, dia],
    );
  }

  function montarRegra() {
    const fim = termina === "data" ? parseDataBR(dataFim) : null;
    return {
      recorrencia,
      diasSemana: recorrencia === "semanal" ? diasSemana : [],
      terminaEm: fim ? toIsoDate(fim) : null,
    };
  }

  function validar() {
    const proximos = {};
    if (recorrencia === "semanal" && diasSemana.length === 0) {
      proximos.dias = "Escolha pelo menos um dia da semana";
    }
    if (recorrencia !== "nenhuma" && termina === "data") {
      const fim = parseDataBR(dataFim);
      if (!fim) proximos.dataFim = "Informe uma data válida (DD/MM/AAAA)";
      else if (dataInicio && fim < dataInicio) {
        proximos.dataFim = "Precisa ser depois do início do evento";
      }
    }
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  function handleSalvar() {
    if (!validar()) return;
    navigation.popTo(
      "EventoForm",
      { regraRecorrencia: montarRegra() },
      { merge: true },
    );
  }

  const repete = recorrencia !== "nenhuma";
  const previaValida =
    repete &&
    dataInicio &&
    !(recorrencia === "semanal" && diasSemana.length === 0) &&
    !(termina === "data" && !parseDataBR(dataFim));
  const previa = previaValida
    ? gerarOcorrencias(
        {
          dataInicio,
          recorrencia,
          diasSemana,
          terminaEm: termina === "data" ? parseDataBR(dataFim) : null,
        },
        { quantidade: QTD_PREVIA },
      )
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Recorrência"
          lead="Defina quando o evento deve se repetir."
          onBack={() => navigation.goBack()}
        />

        <Text style={styles.label}>Repetir</Text>
        <View style={styles.opcoes}>
          {OPCOES_PRINCIPAIS.map((opcao) => (
            <Radio
              key={opcao}
              label={RECORRENCIA_LABELS[opcao]}
              selecionado={recorrencia === opcao}
              onPress={() => {
                setPersonalizado(false);
                escolher(opcao);
              }}
            />
          ))}
          <Radio
            label="Personalizado"
            selecionado={personalizado}
            onPress={() => {
              setPersonalizado(true);
              if (!OPCOES_PERSONALIZADAS.includes(recorrencia)) {
                escolher(OPCOES_PERSONALIZADAS[0]);
              }
            }}
            direita={
              <Feather
                name={personalizado ? "chevron-down" : "chevron-right"}
                size={16}
                color={colors.textMuted}
              />
            }
          />
          {personalizado ? (
            <View style={styles.subopcoes}>
              {OPCOES_PERSONALIZADAS.map((opcao) => (
                <Radio
                  key={opcao}
                  label={RECORRENCIA_LABELS[opcao]}
                  selecionado={recorrencia === opcao}
                  onPress={() => escolher(opcao)}
                  destaque={false}
                />
              ))}
            </View>
          ) : null}
        </View>

        {recorrencia === "semanal" ? (
          <Card style={[styles.bloco, erros.dias && styles.blocoErro]}>
            <Text style={styles.blocoTitulo}>Dias da semana</Text>
            <View style={styles.dias}>
              {DIAS_SEMANA_CURTOS.map((sigla, dia) => {
                const marcado = diasSemana.includes(dia);
                return (
                  <Pressable
                    key={sigla}
                    onPress={() => alternarDia(dia)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: marcado }}
                    accessibilityLabel={getWeekdayName(dia)}
                    style={[styles.dia, marcado && styles.diaMarcado]}
                  >
                    <Text
                      style={[
                        styles.diaTexto,
                        marcado && styles.diaTextoMarcado,
                      ]}
                    >
                      {sigla}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={erros.dias ? styles.erro : styles.ajuda}>
              {erros.dias ?? descreverDias(diasSemana)}
            </Text>
          </Card>
        ) : null}

        <View style={styles.campo}>
          <Text style={styles.label}>Começa em</Text>
          <View style={styles.somenteLeitura}>
            <Text
              style={dataInicio ? styles.somenteLeituraTexto : styles.ajuda}
            >
              {dataInicio
                ? formatDateBR(dataInicio)
                : "Defina a data no formulário do evento"}
            </Text>
            <Feather name="calendar" size={16} color={colors.textMuted} />
          </View>
        </View>

        {repete ? (
          <Card style={styles.bloco}>
            <Text style={styles.blocoTitulo}>Termina</Text>
            <Radio
              label="Nunca"
              selecionado={termina === "nunca"}
              onPress={() => setTermina("nunca")}
              destaque={false}
            />
            <Radio
              label="Em uma data específica"
              selecionado={termina === "data"}
              onPress={() => setTermina("data")}
              destaque={false}
            />
            {termina === "data" ? (
              <TextField
                icon="calendar"
                placeholder="DD/MM/AAAA"
                value={dataFim}
                onChangeText={(texto) => {
                  setDataFim(mascararData(texto));
                  setErros((atuais) => ({ ...atuais, dataFim: undefined }));
                }}
                error={erros.dataFim}
                keyboardType="number-pad"
                maxLength={10}
              />
            ) : null}
          </Card>
        ) : null}

        {previa.length ? (
          <View style={styles.campo}>
            <Text style={styles.label}>Próximas datas</Text>
            {previa.map((data) => (
              <View key={toIsoDate(data)} style={styles.previa}>
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text style={styles.previaData}>{formatFullDate(data)}</Text>
                <Text style={styles.previaDia}>{getWeekdayLabel(data)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Button title="Salvar recorrência" onPress={handleSalvar} />
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
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  opcoes: {
    gap: 8,
    marginTop: -6,
  },
  opcao: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  opcaoSelecionada: {
    backgroundColor: colors.primaryTint,
  },
  opcaoSimples: {
    minHeight: 36,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelecionado: {
    borderColor: colors.primary,
  },
  radioPonto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  opcaoTexto: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  opcaoTextoSelecionado: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  subopcoes: {
    paddingLeft: 30,
  },
  bloco: {
    gap: 10,
  },
  blocoErro: {
    borderColor: colors.primary,
  },
  blocoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  dias: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dia: {
    width: 40,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  diaMarcado: {
    backgroundColor: colors.primary,
  },
  diaTexto: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textMuted,
  },
  diaTextoMarcado: {
    color: "#FFFFFF",
  },
  ajuda: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  erro: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  campo: {
    gap: 8,
  },
  somenteLeitura: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  somenteLeituraTexto: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  previa: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previaData: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  previaDia: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
