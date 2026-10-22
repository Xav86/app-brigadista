import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import DateListItem from "../../../components/DateListItem";
import ScreenHeader from "../../../components/ScreenHeader";
import { colors, fonts, spacing } from "../../../theme";
import { parseIsoDate } from "../../../utils/calendar";

// Tempo simulado de envio enquanto não há backend para receber a solicitação.
const ATRASO_ENVIO_MS = 600;

export default function ConfirmarDisponibilidadeScreen({ navigation, route }) {
  const { datas, competencia } = route.params;
  const [enviando, setEnviando] = useState(false);

  function handleEnviar() {
    setEnviando(true);
    setTimeout(() => {
      navigation.replace("DisponibilidadeEnviada", { datas, competencia });
    }, ATRASO_ENVIO_MS);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <ScreenHeader
          title="Confirmar disponibilidade"
          lead="Confira as datas selecionadas antes de enviar."
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.lista}>
          <Text style={styles.sectionTitle}>Datas selecionadas</Text>
          {datas.map((iso) => (
            <Card key={iso}>
              <DateListItem data={parseIsoDate(iso)} />
            </Card>
          ))}

          <Card tinted style={styles.aviso}>
            <View style={styles.avisoIcone}>
              <Feather name="bell" size={14} color={colors.primary} />
            </View>
            <View style={styles.avisoTexto}>
              <Text style={styles.avisoTitulo}>Análise do administrador</Text>
              <Text style={styles.avisoCorpo}>
                O administrador analisará sua disponibilidade. Você receberá uma
                notificação assim que houver uma atualização.
              </Text>
            </View>
          </Card>
        </ScrollView>

        <Button
          title="Enviar disponibilidade"
          rightIcon="arrow-right"
          onPress={handleEnviar}
          loading={enviando}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.screen,
    gap: 16,
  },
  lista: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  aviso: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  avisoIcone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avisoTexto: {
    flex: 1,
    gap: 3,
  },
  avisoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  avisoCorpo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
