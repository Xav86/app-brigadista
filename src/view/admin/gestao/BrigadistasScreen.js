import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import { colors, fonts, radius, spacing } from "../../../theme";
import {
  ESPECIALIDADES_LABELS,
  extrairIniciais,
  useBrigadistas,
} from "./useBrigadistas";
import FiltrosBrigadistasSheet, {
  bateFiltros,
  contarFiltros,
  FILTROS_VAZIOS,
} from "./FiltrosBrigadistasSheet";

export default function BrigadistasScreen({ navigation }) {
  const { brigadistas, tiposCertificados, loading, erro } = useBrigadistas();
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Admins também ficam na coleção de usuários, mas não são brigadistas.
  const equipe = brigadistas.filter((b) => b.tipoUsuario !== "admin");

  function filtrar(filtrosAplicados) {
    const termo = busca.trim().toLowerCase();
    return equipe.filter((b) => {
      const bateBusca =
        !termo ||
        b.nome?.toLowerCase().includes(termo) ||
        b.email?.toLowerCase().includes(termo) ||
        b.cpf?.toLowerCase().includes(termo);

      return bateBusca && bateFiltros(b, filtrosAplicados);
    });
  }

  const filtrados = filtrar(filtros);
  const qtdFiltros = contarFiltros(filtros);

  // Um chip por filtro aplicado, para dar pra ver e remover direto na tela.
  const nomeCertificado = tiposCertificados.find(
    (t) => t.id === filtros.certificadoId,
  )?.nome;
  const chipsAtivos = [
    filtros.status && {
      campo: "status",
      label: filtros.status === "ativo" ? "Ativos" : "Inativos",
    },
    filtros.sanguineo && {
      campo: "sanguineo",
      label: `Sangue ${filtros.sanguineo}`,
    },
    filtros.certificadoId && {
      campo: "certificadoId",
      label: nomeCertificado ?? "Certificado",
    },
  ].filter(Boolean);

  function removerFiltro(campo) {
    setFiltros((atual) => ({ ...atual, [campo]: "" }));
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleRow}>
              {navigation.canGoBack() ? (
                <Pressable
                  style={styles.voltar}
                  onPress={() => navigation.goBack()}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                >
                  <Feather name="arrow-left" size={16} color={colors.text} />
                </Pressable>
              ) : null}
              <Text style={styles.title}>Brigadistas</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.novoAtalho,
                pressed && styles.novoAtalhoPressed,
              ]}
              onPress={() => navigation.navigate("NovoBrigadista")}
              accessibilityRole="button"
              accessibilityLabel="Novo brigadista"
            >
              <Feather name="plus" size={15} color={colors.primary} />
              <Text style={styles.novoAtalhoText}>Novo</Text>
            </Pressable>
          </View>
          <Text style={styles.lead}>
            Gerencie a equipe, acessos e certificações.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar brigadista"
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
          />
          <Pressable
            style={styles.filtroBotao}
            onPress={() => setFiltrosAbertos(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              qtdFiltros
                ? `Filtrar brigadistas, ${qtdFiltros} aplicados`
                : "Filtrar brigadistas"
            }
          >
            <Feather
              name="sliders"
              size={18}
              color={qtdFiltros ? colors.primary : colors.textMuted}
            />
            {qtdFiltros ? (
              <View style={styles.filtroBadge}>
                <Text style={styles.filtroBadgeText}>{qtdFiltros}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {chipsAtivos.length ? (
          <View style={styles.chipsAtivos}>
            {chipsAtivos.map((chip) => (
              <Pressable
                key={chip.campo}
                style={styles.chipAtivo}
                onPress={() => removerFiltro(chip.campo)}
                accessibilityRole="button"
                accessibilityLabel={`Remover filtro ${chip.label}`}
              >
                <Text style={styles.chipAtivoText}>{chip.label}</Text>
                <Feather name="x" size={12} color={colors.primary} />
              </Pressable>
            ))}
            <Pressable
              onPress={() => setFiltros(FILTROS_VAZIOS)}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.limparTudo}>Limpar</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Equipe cadastrada</Text>
          <Text style={styles.sectionCount}>
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "brigadista" : "brigadistas"}
          </Text>
        </View>

        {erro ? (
          <Card tinted style={styles.erroCard}>
            <Text style={styles.erroText}>{erro}</Text>
          </Card>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>
              Carregando brigadistas do Firebase...
            </Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {filtrados.length ? (
              filtrados.map((item) => {
                const qtdCerts = item.certificados?.length ?? 0;
                const ativo = item.ativo !== false;
                const corStatus = ativo ? colors.success : colors.textMuted;
                const especialidadeLabel =
                  item.especialidade && item.especialidade !== "nenhum"
                    ? ESPECIALIDADES_LABELS[item.especialidade]
                    : null;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      navigation.navigate("DetalhesBrigadista", {
                        brigadistaId: item.id,
                      })
                    }
                    accessibilityRole="button"
                  >
                    {({ pressed }) => (
                      <Card
                        style={[
                          styles.brigadistaCard,
                          pressed && styles.cardPressed,
                        ]}
                      >
                        <View style={styles.avatar}>
                          {item.fotoUrl ? (
                            <Image
                              source={{ uri: item.fotoUrl }}
                              style={styles.avatarFoto}
                            />
                          ) : (
                            <Text style={styles.avatarText}>
                              {extrairIniciais(item.nome)}
                            </Text>
                          )}
                        </View>

                        <View style={styles.info}>
                          <Text style={styles.nome} numberOfLines={1}>
                            {item.nome}
                          </Text>
                          <View style={styles.metaRow}>
                            <View
                              style={[
                                styles.statusBadge,
                                ativo
                                  ? styles.statusAtivoBg
                                  : styles.statusInativoBg,
                              ]}
                            >
                              <View
                                style={[
                                  styles.statusDot,
                                  { backgroundColor: corStatus },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.statusLabel,
                                  { color: corStatus },
                                ]}
                              >
                                {ativo ? "Ativo" : "Inativo"}
                              </Text>
                            </View>

                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.certCount} numberOfLines={1}>
                              {qtdCerts}{" "}
                              {qtdCerts === 1 ? "certificação" : "certificações"}
                              {especialidadeLabel
                                ? ` • ${especialidadeLabel}`
                                : ""}
                            </Text>
                          </View>
                        </View>

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
            ) : equipe.length && (qtdFiltros || busca.trim()) ? (
              <View style={styles.vazioWrap}>
                <Text style={styles.vazio}>
                  Nenhum brigadista encontrado com esses filtros.
                </Text>
                <Pressable
                  onPress={() => {
                    setFiltros(FILTROS_VAZIOS);
                    setBusca("");
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.limparTudo}>Limpar busca e filtros</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.vazio}>
                Nenhum brigadista cadastrado no banco ainda.
              </Text>
            )}
          </View>
        )}

        <Button
          title="Novo brigadista"
          leftIcon="plus"
          onPress={() => navigation.navigate("NovoBrigadista")}
          style={styles.ctaNovo}
        />
      </ScrollView>

      <FiltrosBrigadistasSheet
        visible={filtrosAbertos}
        filtros={filtros}
        tiposCertificados={tiposCertificados}
        contar={(f) => filtrar(f).length}
        onAplicar={setFiltros}
        onClose={() => setFiltrosAbertos(false)}
      />
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
  header: {
    gap: 6,
    marginTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
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
    fontSize: 24,
    color: colors.text,
  },
  novoAtalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
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
  filtroBotao: {
    padding: 2,
  },
  filtroBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filtroBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  chipsAtivos: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  chipAtivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipAtivoText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  limparTudo: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
    textAlign: "center",
  },
  vazioWrap: {
    alignItems: "center",
    gap: 4,
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
  erroCard: {
    padding: 12,
  },
  erroText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  lista: {
    gap: 10,
  },
  brigadistaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardPressed: {
    backgroundColor: colors.primaryTint,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.primary,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusAtivoBg: {
    backgroundColor: colors.successSoft,
  },
  statusInativoBg: {
    backgroundColor: colors.neutralSoft,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  bullet: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textFaint,
  },
  certCount: {
    flex: 1,
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
  ctaNovo: {
    marginTop: 6,
  },
});
