import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import DateRow from "./DateRow";

export default function EventSummary({ titulo, data, horario, local }) {
  return (
    <View style={styles.container}>
      <DateRow data={data} />
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.meta}>
        <Feather name="clock" size={13} color={colors.textMuted} />
        <Text style={styles.metaText}>{horario}</Text>
      </View>
      <View style={styles.meta}>
        <Feather name="map-pin" size={13} color={colors.textMuted} />
        <Text style={styles.metaText}>{local}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  titulo: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
