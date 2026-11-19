import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import Button from "../../components/Button";
import Card from "../../components/Card";
import OptionsSheet from "../../components/OptionsSheet";
import TextField from "../../components/TextField";
import { auth } from "../../services/firebase";
import { VALORES_TIPO_SANGUINEO } from "../../models";
import {
  buscarUsuarioPorEmail,
  salvarTipoSanguineo,
} from "../../services/firestore";
import { colors, fonts, radius, spacing } from "../../theme";

const OPCOES_TIPO_SANGUINEO = VALORES_TIPO_SANGUINEO.map((tipo) => ({
  value: tipo,
  label: tipo,
}));

export default function InformacoesPessoaisScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [escolhendoSangue, setEscolhendoSangue] = useState(false);

  // Estados para troca de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState("");
  const [errors, setErrors] = useState({});
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const email = auth.currentUser?.email;
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const dados = await buscarUsuarioPorEmail(email);
        setUsuario(dados);
      } catch (err) {
        console.warn("Erro ao buscar dados do perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  async function escolherTipoSanguineo(tipo) {
    if (!usuario) return;
    try {
      await salvarTipoSanguineo(usuario.id, tipo);
      setUsuario({ ...usuario, tipoSanguineo: tipo });
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar o tipo sanguíneo.");
    }
  }

  function formatarDataBr(iso = "") {
    if (!iso) return "-";
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return iso;
  }

  async function handleMudarSenha() {
    const nextErrors = {};

    if (!senhaAtual) nextErrors.senhaAtual = "Informe sua senha atual";
    if (!novaSenha) {
      nextErrors.novaSenha = "Informe a nova senha";
    } else if (novaSenha.length < 6) {
      nextErrors.novaSenha = "A nova senha deve ter no mínimo 6 caracteres";
    }
    if (novaSenha !== confirmaNovaSenha) {
      nextErrors.confirmaNovaSenha = "As senhas não coincidem";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const user = auth.currentUser;
    if (!user || !user.email) {
      Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
      return;
    }

    try {
      setSalvandoSenha(true);

      // 1. Reautentica o usuário com a senha atual para autorizar a troca
      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      // 2. Atualiza a senha no Firebase Auth
      await updatePassword(user, novaSenha);

      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmaNovaSenha("");
      setErrors({});
    } catch (err) {
      if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        setErrors((e) => ({ ...e, senhaAtual: "Senha atual incorreta" }));
      } else if (err?.code === "auth/weak-password") {
        setErrors((e) => ({
          ...e,
          novaSenha: "A senha escolhida é muito fraca",
        }));
      } else {
        Alert.alert(
          "Não foi possível alterar a senha",
          err?.message || "Tente novamente mais tarde.",
        );
      }
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              style={styles.voltar}
              onPress={() => navigation.goBack()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Feather name="arrow-left" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Informações pessoais</Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
          ) : (
            <>
              {/* Card com os dados pessoais */}
              <Card style={styles.cardDados}>
                <Text style={styles.cardTitulo}>Seus dados cadastrais</Text>

                <View style={styles.linhaInfo}>
                  <Text style={styles.rotulo}>Nome completo</Text>
                  <Text style={styles.valor}>
                    {usuario?.nome || auth.currentUser?.displayName || "-"}
                  </Text>
                </View>

                <View style={styles.linhaInfo}>
                  <Text style={styles.rotulo}>E-mail</Text>
                  <Text style={styles.valor}>
                    {usuario?.email || auth.currentUser?.email || "-"}
                  </Text>
                </View>

                <View style={styles.linhaInfo}>
                  <Text style={styles.rotulo}>CPF</Text>
                  <Text style={styles.valor}>{usuario?.cpf || "-"}</Text>
                </View>

                <View style={styles.linhaInfo}>
                  <Text style={styles.rotulo}>Data de nascimento</Text>
                  <Text style={styles.valor}>
                    {formatarDataBr(usuario?.dataNascimento)}
                  </Text>
                </View>

                <Pressable
                  style={styles.linhaInfo}
                  onPress={() => setEscolhendoSangue(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.rotulo}>Tipo sanguíneo</Text>
                  <View style={styles.linhaEditavel}>
                    <Text style={styles.valor}>
                      {usuario?.tipoSanguineo || "Toque para informar"}
                    </Text>
                    <Feather name="chevron-down" size={16} color={colors.textMuted} />
                  </View>
                </Pressable>

                <View style={styles.linhaInfo}>
                  <Text style={styles.rotulo}>Função / Acesso</Text>
                  <Text style={styles.valor}>
                    {usuario?.tipoUsuario === "admin"
                      ? "Administrador"
                      : "Brigadista"}
                  </Text>
                </View>
              </Card>

              {/* Card de alteração de senha */}
              <Card style={styles.cardSenha}>
                <View style={styles.senhaHeader}>
                  <View style={styles.iconeSenha}>
                    <Feather name="shield" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.senhaHeaderTexto}>
                    <Text style={styles.cardTitulo}>Mudar senha de acesso</Text>
                    <Text style={styles.leadSenha}>
                      Defina uma nova senha para entrar na sua conta.
                    </Text>
                  </View>
                </View>

                <View style={styles.formSenha}>
                  <View style={styles.campo}>
                    <Text style={styles.campoLabel}>Senha atual</Text>
                    <TextField
                      icon="lock"
                      placeholder="Sua senha atual"
                      secure
                      value={senhaAtual}
                      onChangeText={(t) => {
                        setSenhaAtual(t);
                        if (errors.senhaAtual)
                          setErrors((e) => ({ ...e, senhaAtual: undefined }));
                      }}
                      error={errors.senhaAtual}
                    />
                  </View>

                  <View style={styles.campo}>
                    <Text style={styles.campoLabel}>Nova senha</Text>
                    <TextField
                      icon="lock"
                      placeholder="Mínimo 6 caracteres"
                      secure
                      value={novaSenha}
                      onChangeText={(t) => {
                        setNovaSenha(t);
                        if (errors.novaSenha)
                          setErrors((e) => ({ ...e, novaSenha: undefined }));
                      }}
                      error={errors.novaSenha}
                    />
                  </View>

                  <View style={styles.campo}>
                    <Text style={styles.campoLabel}>Confirmar nova senha</Text>
                    <TextField
                      icon="lock"
                      placeholder="Repita a nova senha"
                      secure
                      value={confirmaNovaSenha}
                      onChangeText={(t) => {
                        setConfirmaNovaSenha(t);
                        if (errors.confirmaNovaSenha)
                          setErrors((e) => ({
                            ...e,
                            confirmaNovaSenha: undefined,
                          }));
                      }}
                      error={errors.confirmaNovaSenha}
                    />
                  </View>

                  <Button
                    title="Salvar nova senha"
                    leftIcon="check"
                    loading={salvandoSenha}
                    onPress={handleMudarSenha}
                    style={styles.botaoSalvar}
                  />
                </View>
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionsSheet
        visible={escolhendoSangue}
        title="Tipo sanguíneo"
        opcoes={OPCOES_TIPO_SANGUINEO}
        valor={usuario?.tipoSanguineo ?? ""}
        onSelect={escolherTipoSanguineo}
        onClose={() => setEscolhendoSangue(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
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
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardDados: {
    gap: 12,
    padding: 16,
  },
  cardTitulo: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  linhaInfo: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    gap: 2,
  },
  linhaEditavel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rotulo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  valor: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  cardSenha: {
    gap: 14,
    padding: 16,
  },
  senhaHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconeSenha: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  senhaHeaderTexto: {
    flex: 1,
  },
  leadSenha: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  formSenha: {
    gap: 12,
  },
  campo: {
    gap: 4,
  },
  campoLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  botaoSalvar: {
    marginTop: 4,
  },
});
