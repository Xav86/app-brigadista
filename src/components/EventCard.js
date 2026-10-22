import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import Card from "./Card";
import StatusPill from "./StatusPill";

export default function EventCard({
  dia,
  mes,
  titulo,
  horario,
  local,
  statusLabel,
  statusTone,
  passado = false,
  onPress,
}) {
  function renderConteudo(pressed) {
    return (
      <Card style={[styles.card, pressed && styles.cardPressed]}>
        <View style={styles.data}>
          <Text style={[styles.dia, passado && styles.diaPassado]}>{dia}</Text>
          <Text style={styles.mes}>{mes}</Text>
        </View>
        <View style={styles.detalhes}>
          <Text style={styles.titulo} numberOfLines={2}>
            {titulo}
          </Text>
          <View style={styles.meta}>
            <Feather name="clock" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{horario}</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="map-pin" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{local}</Text>
          </View>
        </View>
        {statusLabel ? <StatusPill label={statusLabel} tone={statusTone} /> : null}
      </Card>
    );
  }

  if (!onPress) return renderConteudo(false);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => renderConteudo(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardPressed: {
    backgroundColor: colors.primaryTint,
  },
  data: {
    width: 44,
    alignItems: "center",
  },
  dia: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
  },
  diaPassado: {
    color: colors.textMuted,
  },
  mes: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  detalhes: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 15,
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
    lineHeight: 18,
    color: colors.textMuted,
  },
});
