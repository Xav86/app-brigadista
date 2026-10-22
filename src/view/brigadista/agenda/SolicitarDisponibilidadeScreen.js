import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import DateListItem from "../../../components/DateListItem";
import MonthCalendar from "../../../components/MonthCalendar";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import { parseIsoDate } from "../../../utils/calendar";
import {
  LIMITE_DIAS_POR_SOLICITACAO,
  competenciaAberta,
  diaPermitido,
  validarSelecao,
} from "./competencia";

export default function SolicitarDisponibilidadeScreen({ navigation }) {
  const [competencia] = useState(() => competenciaAberta());
  const [datas, setDatas] = useState([]);
  const [erro, setErro] = useState(null);

  function alternarDia(iso) {
    setErro(null);
    if (datas.includes(iso)) {
      setDatas((atuais) => atuais.filter((item) => item !== iso));
      return;
    }
    if (datas.length >= LIMITE_DIAS_POR_SOLICITACAO) {
      setErro(
        `Você pode enviar no máximo ${LIMITE_DIAS_POR_SOLICITACAO} dias por vez.`,
      );
      return;
    }
    setDatas((atuais) => [...atuais, iso].sort());
  }

  function handleContinuar() {
    const mensagem = validarSelecao(datas, competencia);
    setErro(mensagem);
    if (mensagem) return;
    navigation.navigate("ConfirmarDisponibilidade", { datas, competencia });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Solicitar disponibilidade"
          lead="Selecione os dias em que você tem interesse em servir."
          onBack={() => navigation.goBack()}
        />

        <Card tinted style={styles.competencia}>
          <View style={styles.competenciaTopo}>
            <Text style={styles.competenciaTitulo}>Competência aberta</Text>
            <StatusPill label={competencia.titulo} tone="primary" />
          </View>
          <Text style={styles.texto}>
            Você pode enviar sua disponibilidade para o mês de{" "}
            {competencia.titulo.toLowerCase().replace(" ", " de ")}.
          </Text>
        </Card>

        <MonthCalendar
          ano={competencia.ano}
          mes={competencia.mes}
          diasDestacados={datas}
          onDiaPress={alternarDia}
          diaDesabilitado={(iso) => !diaPermitido(iso, competencia)}
        />

        <Card style={styles.selecionados}>
          <View style={styles.selecionadosTopo}>
            <Text style={styles.sectionTitle}>
              Dias selecionados ({datas.length})
            </Text>
            {datas.length ? (
              <Pressable
                onPress={() => {
                  setDatas([]);
                  setErro(null);
                }}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.link}>Limpar todos</Text>
              </Pressable>
            ) : null}
          </View>

          {datas.length ? (
            datas.map((iso) => (
              <DateListItem
                key={iso}
                data={parseIsoDate(iso)}
                icon="clock"
                onRemove={() => alternarDia(iso)}
              />
            ))
          ) : (
            <View style={styles.vazio}>
              <Feather name="calendar" size={18} color={colors.textFaint} />
              <Text style={styles.texto}>
                Toque nos dias do calendário para selecionar.
              </Text>
            </View>
          )}
        </Card>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Button
          title="Enviar disponibilidade"
          rightIcon="arrow-right"
          onPress={handleContinuar}
          disabled={datas.length === 0}
        />
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
  competencia: {
    gap: 8,
  },
  competenciaTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  competenciaTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  texto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  selecionados: {
    gap: 14,
  },
  selecionadosTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  vazio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  erro: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
    textAlign: "center",
  },
});
