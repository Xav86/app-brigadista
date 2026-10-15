import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import TextField from '../components/TextField';
import { colors, fonts, spacing } from '../theme';

const logo = require('../assets/images/logo.png');

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef(null);

  function handleEntrar() {
    const next = {};
    if (!usuario.trim()) next.usuario = 'Informe seu usuário';
    if (!senha) next.senha = 'Informe sua senha';
    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO: integrar autenticação real. Por enquanto só navega para a área do brigadista.
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/brigadista/escalas');
    }, 400);
  }

  function handleBiometria() {
    Alert.alert('Em breve', 'O login por biometria será habilitado nas próximas versões.');
  }

  function handleAjuda() {
    Alert.alert(
      'Problemas para acessar?',
      'Entre em contato com o administrador da brigada para recuperar seu acesso.'
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image source={logo} style={styles.logo} accessibilityLabel="Logo da brigada" />
            </View>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Entre para acessar o sistema da brigada</Text>
          </View>

          <View style={styles.form}>
            <TextField
              icon="user"
              placeholder="Usuário"
              value={usuario}
              onChangeText={(t) => {
                setUsuario(t);
                if (errors.usuario) setErrors((e) => ({ ...e, usuario: undefined }));
              }}
              error={errors.usuario}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
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
                if (errors.senha) setErrors((e) => ({ ...e, senha: undefined }));
              }}
              error={errors.senha}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleEntrar}
            />

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
            />
          </View>

          <Pressable onPress={handleAjuda} style={styles.help} accessibilityRole="button">
            <View style={styles.helpRow}>
              <Feather name="help-circle" size={16} color={colors.textMuted} />
              <Text style={styles.helpTitle}>Problemas para acessar?</Text>
            </View>
            <Text style={styles.helpText}>Entre em contato com o administrador</Text>
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
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 8,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  cta: {
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    gap: 4,
    paddingTop: 24,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
