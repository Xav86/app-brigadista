import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius } from "../../../theme";

// Miniatura da foto do certificado. Ao tocar, abre a foto em tela cheia.
export default function FotoCertificado({ uri }) {
  const [aberta, setAberta] = useState(false);

  if (!uri) {
    return (
      <View style={styles.semFoto}>
        <Feather name="image" size={16} color={colors.textMuted} />
        <Text style={styles.semFotoTexto}>Sem foto enviada</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setAberta(true)}
        accessibilityRole="button"
        accessibilityLabel="Ver foto do certificado"
      >
        <Image source={{ uri }} style={styles.miniatura} resizeMode="contain" />
        <Text style={styles.dica}>Toque para ampliar</Text>
      </Pressable>

      <Modal
        visible={aberta}
        transparent
        animationType="fade"
        onRequestClose={() => setAberta(false)}
      >
        <View style={styles.fundo}>
          <Image source={{ uri }} style={styles.grande} resizeMode="contain" />
          <Pressable
            style={styles.fechar}
            onPress={() => setAberta(false)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  miniatura: {
    width: "100%",
    height: 180,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  dica: {
    marginTop: 4,
    alignSelf: "flex-end",
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  semFoto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  semFotoTexto: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  grande: {
    width: "100%",
    height: "80%",
  },
  fechar: {
    position: "absolute",
    top: 48,
    right: 20,
  },
});