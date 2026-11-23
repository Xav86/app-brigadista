import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { auth } from "../../../services/firebase";
import { escutarUsuarios } from "../../../services/firestore";
import { colors, fonts, spacing } from "../../../theme";
import { formatDateBR, parseIsoDate } from "../../../utils/calendar";
import { diasParaVencer } from "../../../utils/certificados";

function situacao(dataValidadeIso) {
  const dias = diasParaVencer(dataValidadeIso);
  if (dias < 0) return { label: "Vencido", tone: "primary" };
  if (dias <= 60) return { label: "Vence em breve", tone: "warning" };
  return { label: "Válido", tone: "success" };
}

export default function CertificacoesScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const email = auth.currentUser?.email?.toLowerCase();

  // Escuta os usuários no Firestore: quando o brigadista envia um certificado, a lista já atualiza.
  useEffect(() => {
    const pararDeEscutar = escutarUsuarios(
      (lista) => {
        setUsuario(lista.find((u) => u.email.toLowerCase() === email) ?? null);
        setCarregando(false);
      },
      () => setCarregando(false),
    );
    return pararDeEscutar;
  }, []);

  const certificados = usuario?.certificados ?? [];
  //fotos ficam no proprio usuaio no firestore: { [tipoCertificadoId]: "data:image/jpeg;base64,..." }
  const fotos = usuario?.fotosCertificados ?? {};

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Certificações"
          lead="Envie a foto dos seus certificados e a data de vencimento."
          onBack={() => navigation.goBack()}
        />

        {carregando ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.lista}>
            {certificados.length ? (
              certificados.map((cert) => {
                const status = situacao(cert.dataValidade);
                const foto = fotos[cert.tipoCertificadoId];
                return (
                  <Pressable
                    key={cert.tipoCertificadoId}
                    onPress={() =>
                      navigation.navigate("EnviarCertificado", {
                        tipoCertificadoId: cert.tipoCertificadoId,
                      })
                    }
                    accessibilityRole="button"
                  >
                    {({ pressed }) => (
                      <Card
                        style={[styles.card, pressed && styles.cardPressed]}
                      >
                        {foto ? (
                          <Image source={{ uri: foto }} style={styles.miniatura} />
                        ) : (
                          <View style={styles.simbolo}>
                            <Feather
                              name="award"
                              size={16}
                              color={colors.primary}
                            />
                          </View>
                        )}
                        <View style={styles.textos}>
                          <Text style={styles.nome} numberOfLines={1}>
                            {cert.nomeCertificado}
                          </Text>
                          <Text style={styles.meta}>
                            Vence em{" "}
                            {formatDateBR(parseIsoDate(cert.dataValidade))}
                          </Text>
                        </View>
                        <StatusPill label={status.label} tone={status.tone} />
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
                Você ainda não enviou nenhum certificado.
              </Text>
            )}
          </View>
        )}

        <Button
          title="Enviar certificado"
          leftIcon="upload"
          onPress={() => navigation.navigate("EnviarCertificado")}
        />
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
  miniatura: {
    width: 36,
    height: 36,
    borderRadius: 10,
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