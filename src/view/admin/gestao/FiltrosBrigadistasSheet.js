import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import FilterChips from "../../../components/FilterChips";
import { VALORES_TIPO_SANGUINEO } from "../../../models";
import { colors, fonts, radius } from "../../../theme";

// "" em qualquer campo = sem filtro naquele grupo.
export const FILTROS_VAZIOS = { status: "", sanguineo: "", certificadoId: "" };

const OPCOES_STATUS = [
  { key: "", label: "Todos" },
  { key: "ativo", label: "Ativos" },
  { key: "inativo", label: "Inativos" },
];

const OPCOES_SANGUINEO = [
  { key: "", label: "Todos" },
  ...VALORES_TIPO_SANGUINEO.map((tipo) => ({ key: tipo, label: tipo })),
];

export function contarFiltros(filtros) {
  return Object.values(filtros).filter(Boolean).length;
}

// Filtros de grupos diferentes se combinam com "E"; dentro do grupo só há um valor.
export function bateFiltros(brigadista, filtros) {
  if (filtros.status === "ativo" && brigadista.ativo === false) return false;
  if (filtros.status === "inativo" && brigadista.ativo !== false) return false;

  if (filtros.sanguineo && brigadista.tipoSanguineo !== filtros.sanguineo) {
    return false;
  }

  if (
    filtros.certificadoId &&
    !(brigadista.certificados ?? []).some(
      (c) => c.tipoCertificadoId === filtros.certificadoId,
    )
  ) {
    return false;
  }

  return true;
}

// Folha de filtros da listagem de brigadistas.
// `contar(filtros)` devolve quantos brigadistas sobrariam com aqueles filtros
// (mostrado no botão "Mostrar N").
export default function FiltrosBrigadistasSheet({
  visible,
  filtros,
  tiposCertificados,
  contar,
  onAplicar,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  const [rascunho, setRascunho] = useState(filtros);

  // Cada vez que abre, parte do que está aplicado hoje.
  useEffect(() => {
    if (visible) setRascunho(filtros);
  }, [visible, filtros]);

  const opcoesCertificado = [
    { key: "", label: "Todos" },
    ...tiposCertificados.map((t) => ({ key: t.id, label: t.nome })),
  ];

  function atualizar(campo, valor) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  const total = contar(rascunho);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.fundo}
        onPress={onClose}
        accessibilityLabel="Fechar"
      />
      <View
        style={[styles.folha, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.alca} />
        <View style={styles.topo}>
          <Text style={styles.titulo}>Filtros</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Feather name="x" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.grupos}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>Status</Text>
            <FilterChips
              wrap
              opcoes={OPCOES_STATUS}
              valor={rascunho.status}
              onChange={(v) => atualizar("status", v)}
            />
          </View>

          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>Tipo sanguíneo</Text>
            <FilterChips
              wrap
              opcoes={OPCOES_SANGUINEO}
              valor={rascunho.sanguineo}
              onChange={(v) => atualizar("sanguineo", v)}
            />
          </View>

          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>Certificado</Text>
            {tiposCertificados.length ? (
              <FilterChips
                wrap
                opcoes={opcoesCertificado}
                valor={rascunho.certificadoId}
                onChange={(v) => atualizar("certificadoId", v)}
              />
            ) : (
              <Text style={styles.semOpcoes}>
                Nenhum tipo de certificado ativo cadastrado.
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.rodape}>
          <Button
            title="Limpar"
            variant="outline"
            onPress={() => setRascunho(FILTROS_VAZIOS)}
            disabled={contarFiltros(rascunho) === 0}
            style={styles.rodapeBotao}
          />
          <Button
            title={`Mostrar ${total}`}
            onPress={() => {
              onAplicar(rascunho);
              onClose();
            }}
            style={styles.rodapeBotao}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(28, 31, 38, 0.4)",
  },
  folha: {
    maxHeight: "80%",
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  alca: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  grupos: {
    gap: 20,
    paddingBottom: 16,
  },
  grupo: {
    gap: 10,
  },
  grupoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  semOpcoes: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  rodape: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rodapeBotao: {
    flex: 1,
  },
});
