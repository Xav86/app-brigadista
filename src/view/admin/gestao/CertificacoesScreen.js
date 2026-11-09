import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../../theme";
import { useBrigadistas } from "./useBrigadistas";

// Lista dos tipos de certificado (templates) que o administrador cadastrou.
export default function CertificacoesScreen({ navigation }) {
  const { brigadistas, tiposCadastrados, loading } = useBrigadistas();
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const filtrados = tiposCadastrados.filter(
    (tipo) => !termo || tipo.nome.toLowerCase().includes(termo),
  );

  // Quantos brigadistas já enviaram um certificado desse tipo.
  function contarBrigadistas(tipoId) {
    return brigadistas.filter((brigadista) =>
      (brigadista.certificados ?? []).some(
        (cert) => cert.tipoCertificadoId === tipoId,
      ),
    ).length;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Certificações"
          lead="Gerencie as certificações da equipe."
          onBack={() => navigation.goBack()}
          right={
            <Pressable
              style={({ pressed }) => [
                styles.novoAtalho,
                pressed && styles.novoAtalhoPressed,
              ]}
              onPress={() => navigation.navigate("CertificadoForm")}
              accessibilityRole="button"
              accessibilityLabel="Nova certificação"
            >
              <Feather name="plus" size={15} color={colors.primary} />
              <Text style={styles.novoAtalhoText}>Nova</Text>
            </Pressable>
          }
        />

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar certificação"
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todas as certificações</Text>
          <Text style={styles.sectionCount}>
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "certificação" : "certificações"}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.lista}>
            {filtrados.length ? (
              filtrados.map((tipo) => {
                const qtd = contarBrigadistas(tipo.id);
                return (
                  <Pressable
                    key={tipo.id}
                    onPress={() =>
                      navigation.navigate("CertificadoForm", {
                        tipoId: tipo.id,
                      })
                    }
                    accessibilityRole="button"
                  >
                    {({ pressed }) => (
                      <Card
                        style={[styles.card, pressed && styles.cardPressed]}
                      >
                        <View style={styles.simbolo}>
                          <Feather
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.textos}>
                          <Text style={styles.nome} numberOfLines={1}>
                            {tipo.nome}
                          </Text>
                          <Text style={styles.meta}>
                            {qtd} {qtd === 1 ? "brigadista" : "brigadistas"}
                          </Text>
                        </View>
                        <StatusPill
                          label={tipo.ativo ? "Ativa" : "Inativa"}
                          tone={tipo.ativo ? "success" : "neutral"}
                        />
                        <Feather
                          name="chevron-right"
                          size={18}
                          color={colors.textMuted}
                        />
                      </Card>
                    )}
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.vazio}>
                {termo
                  ? "Nenhuma certificação encontrada."
                  : "Nenhuma certificação cadastrada ainda."}
              </Text>
            )}
          </View>
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
  novoAtalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  novoAtalhoPressed: {
    opacity: 0.8,
  },
  novoAtalhoText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fonts.regular,
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
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 32,
  },
  lista: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  cardPressed: {
    backgroundColor: colors.primaryTint,
  },
  simbolo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: {
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