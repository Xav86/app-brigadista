import { Feather } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../../components/Card";
import { colors, fonts, radius, spacing } from "../../../theme";

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

export default function GestaoScreen({ navigation, onLogout }) {
  const opcoes = [
    {
      key: "certificados",
      label: "Certificados",
      onPress: emBreve,
    },
    {
      key: "brigadistas",
      label: "Brigadistas",
      onPress: () => navigation.navigate("Brigadistas"),
    },
    {
      key: "eventos",
      label: "Eventos",
      onPress: () => {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("Eventos");
        } else {
          emBreve();
        }
      },
    },
    {
      key: "configuracoes",
      label: "Configurações",
      onPress: emBreve,
    },
  ];

  function handleSair() {
    if (onLogout) {
      onLogout();
      return;
    }
    Alert.alert("Sair da conta", "Deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive" },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestão</Text>
            <Text style={styles.lead}>
              Gerencie a equipe, acessos e certificações.
            </Text>
          </View>

          <View style={styles.lista}>
            {opcoes.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Card style={[styles.itemCard, pressed && styles.itemPressed]}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={colors.textMuted}
                    />
                  </Card>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSair}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.sairBtn,
            pressed && styles.sairBtnPressed,
          ]}
        >
          <Feather
            name="corner-down-right"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.sairLabel}>Sair da conta</Text>
        </Pressable>
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
    flexGrow: 1,
    padding: spacing.screen,
    paddingBottom: 24,
    justifyContent: "space-between",
    gap: 24,
  },
  top: {
    gap: 20,
  },
  header: {
    gap: 6,
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  lista: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: radius.md,
  },
  itemPressed: {
    backgroundColor: colors.primaryTint,
  },
  itemLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  sairBtn: {
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  sairBtnPressed: {
    backgroundColor: colors.primarySoft,
  },
  sairLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
});
