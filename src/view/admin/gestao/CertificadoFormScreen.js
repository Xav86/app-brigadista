import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import TextField from "../../../components/TextField";
import { colors, fonts, spacing } from "../../../theme";
import { useBrigadistas } from "./useBrigadistas";

// Alert.alert simples não aparece no Expo Web, então lá usamos o alert do navegador.
function avisar(titulo, mensagem) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

function Campo({ label, children, style }) {
  return (
    <View style={[styles.campo, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

// Cadastro e edição de um tipo de certificado (template) pelo administrador.
export default function CertificadoFormScreen({ navigation, route }) {
  const { tiposCadastrados, salvarTipoCertificado } = useBrigadistas();
  const tipoId = route?.params?.tipoId;
  const existente = tiposCadastrados.find((tipo) => tipo.id === tipoId);
  const editando = Boolean(existente);

  const [form, setForm] = useState({
    nome: existente?.nome ?? "",
    descricao: existente?.descricao ?? "",
    cargaHoraria: existente ? String(existente.cargaHoraria) : "",
    validadeMeses: existente ? String(existente.validadeMeses) : "",
    ativo: existente?.ativo ?? true,
  });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function alterar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    setErros({ ...erros, [campo]: null });
  }

  function validar() {
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome.";
    if (!form.descricao.trim()) novosErros.descricao = "Informe a descrição.";
    if (!(Number(form.cargaHoraria) > 0)) {
      novosErros.cargaHoraria = "Informe as horas.";
    }
    if (!(Number(form.validadeMeses) > 0)) {
      novosErros.validadeMeses = "Informe os meses.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;

    setSalvando(true);
    try {
      await salvarTipoCertificado(existente?.id, {
        nome: form.nome,
        descricao: form.descricao,
        cargaHoraria: Number(form.cargaHoraria),
        validadeMeses: Number(form.validadeMeses),
        ativo: form.ativo,
      });
      navigation.goBack();
    } catch (e) {
      avisar("Não foi possível salvar", e.message || "Tente novamente.");
    } finally {
      setSalvando(false);
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
          <ScreenHeader
            title={editando ? "Editar certificação" : "Nova certificação"}
            lead="Os brigadistas vão enviar certificados deste tipo pelo perfil."
            onBack={() => navigation.goBack()}
          />

          <Campo label="Nome">
            <TextField
              placeholder="NR-23"
              value={form.nome}
              onChangeText={(texto) => alterar("nome", texto)}
              error={erros.nome}
            />
          </Campo>

          <Campo label="Descrição">
            <TextField
              placeholder="Proteção Contra Incêndios"
              value={form.descricao}
              onChangeText={(texto) => alterar("descricao", texto)}
              error={erros.descricao}
              multiline
            />
          </Campo>

          <View style={styles.linha}>
            <Campo label="Carga horária (h)" style={styles.flex}>
              <TextField
                placeholder="8"
                value={form.cargaHoraria}
                onChangeText={(texto) =>
                  alterar("cargaHoraria", texto.replace(/\D/g, ""))
                }
                error={erros.cargaHoraria}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Campo>
            <Campo label="Validade (meses)" style={styles.flex}>
              <TextField
                placeholder="12"
                value={form.validadeMeses}
                onChangeText={(texto) =>
                  alterar("validadeMeses", texto.replace(/\D/g, ""))
                }
                error={erros.validadeMeses}
                keyboardType="number-pad"
                maxLength={3}
              />
            </Campo>
          </View>

          <Card style={styles.ativoCard}>
            <View style={styles.flex}>
              <Text style={styles.cardTitulo}>Certificação ativa</Text>
              <Text style={styles.cardTexto}>
                Só as ativas aparecem para o brigadista enviar.
              </Text>
            </View>
            <Switch
              value={form.ativo}
              onValueChange={(valor) => alterar("ativo", valor)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Certificação ativa"
            />
          </Card>

          <View style={styles.acoes}>
            <Button
              title={editando ? "Salvar alterações" : "Criar certificação"}
              onPress={handleSalvar}
              loading={salvando}
            />
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </View>
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
    padding: spacing.screen,
    paddingBottom: 32,
    gap: 14,
  },
  campo: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  linha: {
    flexDirection: "row",
    gap: 10,
  },
  ativoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  cardTexto: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  acoes: {
    gap: 10,
    marginTop: 6,
  },
});