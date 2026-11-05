import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { colors, fonts, spacing } from "../../theme";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { auth } from "../../services/firebase";
import { buscarUsuarioPorEmail } from "../../services/firestore";

const logo = require("../../assets/images/logo.png");

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [errors, setErrors] = useState({});
  const [erroLoginGeral, setErroLoginGeral] = useState("");
  const [loading, setLoading] = useState(false);
  const [redefinindo, setRedefinindo] = useState(false);
  const [entrandoBiometria, setEntrandoBiometria] = useState(false);
  const senhaRef = useRef(null);

  function validar() {
    const next = {};

    if (!usuario.trim()) next.usuario = "Informe seu e-mail";
    if (!senha) next.senha = "Informe sua senha";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // Busca o cadastro do usuário no Firestore e define o papel de acesso conforme tipoUsuario.
  async function entrarComPerfil(email) {
    const perfil = await buscarUsuarioPorEmail(email);

    if (!perfil) {
      setErroLoginGeral(
        "Usuário autenticado, mas o cadastro não foi encontrado no sistema.",
      );
      return;
    }

    const role = perfil.tipoUsuario === "admin" ? "admin" : "brigadista";
    onLogin(role);
  }

  async function handleEntrar() {
    setErroLoginGeral("");
    if (!validar()) return;

    try {
      setLoading(true);

      const emailLimpo = usuario.trim().toLowerCase();
      const senhaLimpa = senha.trim();

      // 1. Autenticação no Firebase Auth
      const credencial = await signInWithEmailAndPassword(
        auth,
        emailLimpo,
        senhaLimpa,
      );

      // 2. Consulta o perfil no Firestore e entra com o papel (role) dele
      await entrarComPerfil(credencial.user.email || emailLimpo);
    } catch (error) {
      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/user-not-found" ||
        error?.code === "auth/wrong-password"
      ) {
        setErroLoginGeral("E-mail ou senha inválidos. Verifique e tente novamente.");
      } else if (error?.code === "auth/invalid-email") {
        setErrors((e) => ({ ...e, usuario: "Formato de e-mail inválido." }));
      } else if (error?.code === "auth/user-disabled") {
        setErroLoginGeral("Este usuário foi desativado. Contate o administrador.");
      } else if (error?.code === "auth/too-many-requests") {
        setErroLoginGeral(
          "Muitas tentativas sem sucesso. Tente novamente mais tarde.",
        );
      } else {
        setErroLoginGeral("Falha ao entrar. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEsqueciSenha() {
    const emailLimpo = usuario.trim().toLowerCase();
    if (!emailLimpo) {
      setErrors((e) => ({
        ...e,
        usuario: "Digite seu e-mail acima para redefinir a senha",
      }));
      return;
    }

    try {
      setRedefinindo(true);
      await sendPasswordResetEmail(auth, emailLimpo);
      Alert.alert(
        "E-mail de recuperação enviado",
        `Enviamos um link para redefinição de senha para:\n${emailLimpo}\n\nVerifique também sua caixa de spam.`,
      );
    } catch (error) {
      if (error?.code === "auth/user-not-found") {
        Alert.alert(
          "E-mail não encontrado",
          "Não encontramos nenhuma conta com o e-mail informado.",
        );
      } else if (error?.code === "auth/invalid-email") {
        Alert.alert("E-mail inválido", "Informe um endereço de e-mail válido.");
      } else {
        Alert.alert(
          "Erro ao redefinir senha",
          "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.",
        );
      }
    } finally {
      setRedefinindo(false);
    }
  }

  // A biometria reaproveita a última sessão do Firebase salva no aparelho:
  // o usuário precisa ter entrado uma vez com e-mail e senha antes.
  async function handleBiometria() {
    setErroLoginGeral("");

    if (Platform.OS === "web") {
      setErroLoginGeral("O login com biometria só funciona no celular.");
      return;
    }

    try {
      setEntrandoBiometria(true);

      const temSensor = await LocalAuthentication.hasHardwareAsync();
      const temBiometriaCadastrada = await LocalAuthentication.isEnrolledAsync();
      if (!temSensor || !temBiometriaCadastrada) {
        setErroLoginGeral(
          "Este aparelho não tem digital ou reconhecimento facial cadastrado.",
        );
        return;
      }

      await auth.authStateReady();
      const usuarioSalvo = auth.currentUser;
      if (!usuarioSalvo) {
        setErroLoginGeral(
          "Entre uma vez com e-mail e senha para ativar a biometria neste aparelho.",
        );
        return;
      }

      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Entrar no Brigadista",
        cancelLabel: "Cancelar",
      });
      if (!resultado.success) return;

      await entrarComPerfil(usuarioSalvo.email);
    } catch (error) {
      setErroLoginGeral(
        "Não foi possível entrar com biometria. Use seu e-mail e senha.",
      );
    } finally {
      setEntrandoBiometria(false);
    }
  }

  function handleAjuda() {
    Alert.alert(
      "Problemas para acessar?",
      "Entre em contato com o administrador da brigada para recuperar seu acesso.",
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image
                source={logo}
                style={styles.logo}
                accessibilityLabel="Logo da brigada"
              />
            </View>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>
              Entre para acessar o sistema da brigada
            </Text>
          </View>

          <View style={styles.form}>
            {/* Mensagem destacada na tela para e-mail ou senha inválidos */}
            {erroLoginGeral ? (
              <View style={styles.alertaErro}>
                <Feather name="alert-circle" size={16} color={colors.primary} />
                <Text style={styles.alertaErroTexto}>{erroLoginGeral}</Text>
              </View>
            ) : null}

            <TextField
              icon="mail"
              placeholder="E-mail"
              value={usuario}
              onChangeText={(t) => {
                setUsuario(t);
                if (erroLoginGeral) setErroLoginGeral("");
                if (errors.usuario)
                  setErrors((e) => ({ ...e, usuario: undefined }));
              }}
              error={errors.usuario}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => senhaRef.current?.focus()}
            />

            <TextField
              ref={senhaRef}
              icon="lock"
              placeholder="Senha"
              secure
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                if (erroLoginGeral) setErroLoginGeral("");
                if (errors.senha)
                  setErrors((e) => ({ ...e, senha: undefined }));
              }}
              error={errors.senha}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleEntrar}
            />

            {/* Opção nativa para redefinir senha */}
            <Pressable
              onPress={handleEsqueciSenha}
              disabled={redefinindo}
              style={styles.esqueciSenhaWrap}
              hitSlop={8}
            >
              <Text style={styles.esqueciSenhaTexto}>
                {redefinindo ? "Enviando e-mail..." : "Esqueceu a senha?"}
              </Text>
            </Pressable>

            <Button
              title="Entrar"
              rightIcon="arrow-right"
              onPress={handleEntrar}
              loading={loading}
              style={styles.cta}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.line} />
            </View>

            <Button
              title="Entrar com biometria"
              variant="outline"
              leftIcon="fingerprint"
              leftIconFamily={MaterialCommunityIcons}
              onPress={handleBiometria}
              loading={entrandoBiometria}
            />
          </View>

          <Pressable
            onPress={handleAjuda}
            style={styles.help}
            accessibilityRole="button"
          >
            <View style={styles.helpRow}>
              <Feather name="help-circle" size={16} color={colors.textMuted} />
              <Text style={styles.helpTitle}>Problemas para acessar?</Text>
            </View>
            <Text style={styles.helpText}>
              Entre em contato com o administrador
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
  },
  hero: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    gap: 8,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logo: {
    width: 64,
    height: 63,
    borderRadius: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  form: {
    gap: 12,
  },
  alertaErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "#FAD2D4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  alertaErroTexto: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
  },
  esqueciSenhaWrap: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 4,
  },
  esqueciSenhaTexto: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  cta: {
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  help: {
    alignItems: "center",
    gap: 4,
    paddingTop: 24,
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  helpText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
