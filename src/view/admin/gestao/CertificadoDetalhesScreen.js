import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import { formatDateBR, parseIsoDate } from "../../../utils/calendar";
import { diasParaVencer } from "../../../utils/certificados";
import FotoCertificado from "./FotoCertificado";
import { useBrigadistas } from "./useBrigadistas";

function situacao(dataValidadeIso) {
  const dias = diasParaVencer(dataValidadeIso);
  if (dias < 0) return { label: "Vencido", tone: "primary" };
  if (dias <= 60) return { label: "Vence em breve", tone: "warning" };
  return { label: "Válido", tone: "success" };
}

// Detalhes de um tipo de certificado: dados do modelo e quem já enviou (com a foto).
export default function CertificadoDetalhesScreen({ navigation, route }) {
  const { brigadistas, tiposCadastrados } = useBrigadistas();
  const tipoId = route?.params?.tipoId;
  const tipo = tiposCadastrados.find((item) => item.id === tipoId);

  // Brigadistas que têm um certificado desse tipo, junto com o certificado de cada um.
  const envios = brigadistas
    .map((brigadista) => ({
      brigadista,
      cert: (brigadista.certificados ?? []).find(
        (c) => c.tipoCertificadoId === tipoId,
      ),
    }))
    .filter((item) => item.cert);

  if (!tipo) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.content}>
          <ScreenHeader
            title="Certificação"
            onBack={() => navigation.goBack()}
          />
          <Text style={styles.vazio}>Certificação não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={tipo.nome}
          lead={tipo.descricao}
          onBack={() => navigation.goBack()}
          right={
            <Pressable
              style={({ pressed }) => [
                styles.editar,
                pressed && styles.editarPressed,
              ]}
              onPress={() => navigation.navigate("CertificadoForm", { tipoId })}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Editar certificação"
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </Pressable>
          }
        />

        <Card style={styles.resumo}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Carga horária</Text>
            <Text style={styles.resumoValor}>{tipo.cargaHoraria}h</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Validade</Text>
            <Text style={styles.resumoValor}>{tipo.validadeMeses} meses</Text>
          </View>
          <StatusPill
            label={tipo.ativo ? "Ativa" : "Inativa"}
            tone={tipo.ativo ? "success" : "neutral"}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quem enviou</Text>
          <Text style={styles.sectionCount}>
            {envios.length} {envios.length === 1 ? "brigadista" : "brigadistas"}
          </Text>
        </View>

        {envios.length ? (
          envios.map(({ brigadista, cert }) => {
            const status = situacao(cert.dataValidade);
            return (
              <Card key={brigadista.id} style={styles.envio}>
                <View style={styles.envioTopo}>
                  <View style={styles.envioTextos}>
                    <Text style={styles.nome} numberOfLines={1}>
                      {brigadista.nome}
                    </Text>
                    <Text style={styles.meta}>
                      Vence em {formatDateBR(parseIsoDate(cert.dataValidade))}
                    </Text>
                  </View>
                  <StatusPill label={status.label} tone={status.tone} />
                </View>
                <FotoCertificado
                  uri={brigadista.fotosCertificados?.[tipoId]}
                />
              </Card>
            );
          })
        ) : (
          <Text style={styles.vazio}>
            Nenhum brigadista enviou este certificado ainda.
          </Text>
        )}
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
  editar: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  editarPressed: {
    opacity: 0.8,
  },
  resumo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  resumoItem: {
    flex: 1,
    gap: 2,
  },
  resumoLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  resumoValor: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
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
  sectionCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  envio: {
    gap: 10,
  },
  envioTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  envioTextos: {
    flex: 1,
    gap: 2,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
});