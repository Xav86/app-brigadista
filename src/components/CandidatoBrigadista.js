import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius } from "../theme";

// Linha com checkbox usada para escolher brigadistas para uma escala
// (agendamento manual e tela de escala do evento).
// `candidato` vem de montarCandidatos (src/utils/agendamento.js).
export default function CandidatoBrigadista({ candidato, marcado, onPress }) {
  const { brigadista, jaEscalado, disponivel, pendencias } = candidato;
  const certificacoes = brigadista.certificados
    .map((item) => item.nomeCertificado)
    .join(" • ");

  return (
    <Pressable
      onPress={onPress}
      disabled={jaEscalado}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado, disabled: jaEscalado }}
      style={[
        styles.candidato,
        marcado && styles.candidatoMarcado,
        jaEscalado && styles.candidatoDesabilitado,
      ]}
    >
      <View style={[styles.checkbox, marcado && styles.checkboxMarcado]}>
        {marcado ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
      </View>
      <View style={styles.flex}>
        <Text style={styles.candidatoNome}>{brigadista.nome}</Text>
        <Text style={styles.candidatoCert} numberOfLines={1}>
          {certificacoes || "Sem certificações"}
        </Text>
        {pendencias.length && !jaEscalado ? (
          <Text style={styles.candidatoAlerta} numberOfLines={2}>
            Falta: {pendencias.join(", ")}
          </Text>
        ) : null}
      </View>
      {jaEscalado ? (
        <Text style={styles.tagNeutra}>Já escalado</Text>
      ) : disponivel ? (
        <Text style={styles.tagDisponivel}>Disponível</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  candidato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  candidatoMarcado: {
    backgroundColor: colors.primaryTint,
  },
  candidatoDesabilitado: {
    opacity: 0.55,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxMarcado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  candidatoNome: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  candidatoCert: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  candidatoAlerta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.warning,
  },
  tagDisponivel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.success,
  },
  tagNeutra: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textMuted,
  },
});
