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

import Button from "../../components/Button";
import Card from "../../components/Card";
import StatusPill from "../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../theme";

// dados ficticios
const brigadista = { nome: "Carlos Almeida", funcao: "Brigadista", ativo: true };

const OPCOES = [
  {
    id: "pessoais",
    icon: "user",
    titulo: "Informações pessoais",
    descricao: "Nome, e-mail e telefone",
  },
  {
    id: "certificacoes",
    icon: "award",
    titulo: "Certificações",
    descricao: "Suas certificações e validades",
  },
  {
    id: "notificacoes",
    icon: "bell",
    titulo: "Notificações",
    descricao: "Configure seus avisos",
    rota: "Notificacoes",
  },
  {
    id: "sobre",
    icon: "info",
    titulo: "Sobre o aplicativo",
    descricao: "Versão 1.0.0",
  },
];

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

function OpcaoItem({ opcao, onPress}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.opcao, pressed && styles.opcaoPressed]}>
          <View style={styles.simbolo}>
            <Feather name={opcao.icon} size={16} color={colors.primary} />
          </View>
          <View style={styles.opcaoTextos}>
            <Text style={styles.opcaoTitulo}>{opcao.titulo}</Text>
            <Text style={styles.opcaoDescricao}>{opcao.descricao}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Card>
      )}
    </Pressable>
  );
}

export default function PerfilScreen({ navigation, onLogout }) {
  function confirmarSaida() {
    Alert.alert("Sair da conta", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: onLogout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu perfil</Text>
          <Text style={styles.lead}>
            Gerencie suas informações e preferências.
          </Text>
        </View>

        <Card style={styles.perfil}>
          <View style={styles.avatar}>
            <View style={styles.avatarMiolo} />
          </View>
          <View style={styles.perfilInfo}>
            <Text style={styles.nome}>{brigadista.nome}</Text>
            <View style={styles.pills}>
              <StatusPill label={brigadista.funcao} tone="neutral" />
              {brigadista.ativo ? (
                <StatusPill label="Ativo" tone="success" />
              ) : null}
            </View>
          </View>
        </Card>

        <View style={styles.lista}>
                    {OPCOES.map((opcao) => (
            <OpcaoItem
              key={opcao.id}
              opcao={opcao}
              onPress={
                opcao.rota ? () => navigation.navigate(opcao.rota) : emBreve
              }
            />
          ))}
        </View>

        <Button
          title="Sair da conta"
          variant="soft"
          leftIcon="corner-down-right"
          onPress={confirmarSaida}
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
  perfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiolo: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  perfilInfo: {
    flex: 1,
    gap: 8,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
  },
  pills: {
    flexDirection: "row",
    gap: 8,
  },
  lista: {
    gap: 10,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  opcaoPressed: {
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
  opcaoTextos: {
    flex: 1,
    gap: 2,
  },
  opcaoTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  opcaoDescricao: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  
});