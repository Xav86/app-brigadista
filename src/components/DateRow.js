import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import { formatFullDate, getWeekdayLabel } from "../utils/calendar";

export default function DateRow({ data }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Feather name="calendar" size={14} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.data}>{formatFullDate(data)}</Text>
        <Text style={styles.diaSemana}>{getWeekdayLabel(data)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  data: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.text,
  },
  diaSemana: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.textMuted,
  },
});
