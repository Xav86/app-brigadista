import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";

// Cabeçalho das telas internas de um fluxo: botão de voltar, título e uma linha de apoio.
export default function ScreenHeader({ title, lead, onBack, right }) {
  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        {onBack ? (
          <Pressable
            style={styles.voltar}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={16} color={colors.text} />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {right}
      </View>
      {lead ? <Text style={styles.lead}>{lead}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 4,
  },
  linha: {
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
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
