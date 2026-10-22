import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, radius } from "../theme";

// Lista de opções que sobe da parte de baixo da tela, usada no lugar de um <select>.
// `opcoes` é uma lista de { value, label, descricao? }.
export default function OptionsSheet({
  visible,
  title,
  opcoes,
  valor,
  onSelect,
  onClose,
  vazio = "Nenhuma opção disponível.",
}) {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.titulo}>{title}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Feather name="x" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.lista}>
          {opcoes.length === 0 ? (
            <Text style={styles.vazio}>{vazio}</Text>
          ) : null}
          {opcoes.map((opcao) => {
            const selecionada = opcao.value === valor;
            return (
              <Pressable
                key={opcao.value}
                onPress={() => {
                  onSelect(opcao.value);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionada }}
                style={({ pressed }) => [
                  styles.opcao,
                  selecionada && styles.opcaoSelecionada,
                  pressed && styles.opcaoPressionada,
                ]}
              >
                <View style={styles.opcaoTextos}>
                  <Text
                    style={[
                      styles.opcaoLabel,
                      selecionada && styles.opcaoLabelSelecionada,
                    ]}
                  >
                    {opcao.label}
                  </Text>
                  {opcao.descricao ? (
                    <Text style={styles.opcaoDescricao}>{opcao.descricao}</Text>
                  ) : null}
                </View>
                {selecionada ? (
                  <Feather name="check" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
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
    maxHeight: "70%",
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
    marginBottom: 8,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  lista: {
    gap: 6,
    paddingBottom: 8,
  },
  vazio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  opcaoSelecionada: {
    backgroundColor: colors.primaryTint,
  },
  opcaoPressionada: {
    backgroundColor: colors.neutralSoft,
  },
  opcaoTextos: {
    flex: 1,
    gap: 2,
  },
  opcaoLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  opcaoLabelSelecionada: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  opcaoDescricao: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
