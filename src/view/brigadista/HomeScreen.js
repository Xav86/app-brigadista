import { Feather } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/Button";
import Card from "../../components/Card";
import StatusPill from "../../components/StatusPill";
import { colors, fonts, spacing } from "../../theme";

// Dados de exemplo enquanto não há backend/armazenamento local.
const brigadista = { nome: "Carlos" };
const proximaEscala = {
  dia: "12",
  mes: "OUT",
  titulo: "Treinamento da Brigada",
  horario: "Segunda, 08:00 – 12:00",
  local: "Unidade Criciúma",
  status: "Confirmada",
};
const resumo = { confirmadas: 2, pendentes: 1 };
const disponibilidade = { periodo: "Outubro 2026", aberta: true };

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

export default function InicioBrigadista({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {brigadista.nome}!</Text>
          <Text style={styles.lead}>
            Acompanhe suas escalas e informe sua disponibilidade.
          </Text>
        </View>

        <Card tinted style={styles.gap}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>Próxima escala</Text>
            <StatusPill label={proximaEscala.status} tone="success" />
          </View>

          <View style={styles.escala}>
            <View style={styles.data}>
              <Text style={styles.dia}>{proximaEscala.dia}</Text>
              <Text style={styles.mes}>{proximaEscala.mes}</Text>
            </View>
            <View style={styles.detalhes}>
              <Text style={styles.escalaTitulo}>{proximaEscala.titulo}</Text>
              <View style={styles.meta}>
                <Feather name="clock" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{proximaEscala.horario}</Text>
              </View>
              <View style={styles.meta}>
                <Feather name="map-pin" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{proximaEscala.local}</Text>
              </View>
            </View>
          </View>

          <Button
            title="Ver detalhes da escala"
            rightIcon="arrow-right"
            onPress={emBreve}
          />
        </Card>

        <Text style={styles.sectionTitle}>Seu resumo</Text>
        <View style={styles.indicadores}>
          <Pressable
            style={styles.flex}
            onPress={() => navigation.navigate("Escalas")}
          >
            <Card style={styles.indicador}>
              <Text style={[styles.numero, { color: colors.primary }]}>
                {resumo.confirmadas}
              </Text>
              <Text style={styles.indicadorLabel}>Escalas confirmadas</Text>
            </Card>
          </Pressable>
          <Pressable style={styles.flex} onPress={emBreve}>
            <Card style={styles.indicador}>
              <Text style={[styles.numero, { color: colors.warning }]}>
                {resumo.pendentes}
              </Text>
              <Text style={styles.indicadorLabel}>Solicitação pendente</Text>
            </Card>
          </Pressable>
        </View>

        <Card style={[styles.disponibilidade, styles.gapTop]}>
          <View style={styles.simbolo}>
            <Feather name="clock" size={18} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardLabel}>Disponibilidade aberta</Text>
            <Text style={styles.metaText}>{disponibilidade.periodo}</Text>
          </View>
          {disponibilidade.aberta ? (
            <StatusPill label="Aberta" tone="primary" />
          ) : null}
        </Card>

        <Card style={[styles.gap, styles.gapTop]}>
          <Text style={styles.cardLabel}>Quais dias você poderá servir?</Text>
          <Text style={styles.body}>
            Informe os dias em que estará disponível e ajude a organizar as
            próximas escalas da brigada.
          </Text>
          <Button
            title="Informar disponibilidade"
            variant="soft"
            rightIcon="arrow-right"
            onPress={emBreve}
          />
        </Card>
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
  },
  flex: {
    flex: 1,
  },
  header: {
    gap: 6,
    marginTop: 8,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  gap: {
    gap: 14,
  },
  gapTop: {
    marginTop: 12,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  escala: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  data: {
    width: 52,
    alignItems: "center",
  },
  dia: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.primary,
  },
  mes: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  detalhes: {
    flex: 1,
    gap: 4,
  },
  escalaTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginTop: 24,
    marginBottom: 10,
  },
  indicadores: {
    flexDirection: "row",
    gap: 12,
  },
  indicador: {
    minHeight: 100,
    justifyContent: "space-between",
  },
  numero: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  indicadorLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  disponibilidade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  simbolo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});
