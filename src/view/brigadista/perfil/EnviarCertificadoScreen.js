import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
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

import Button from "../../../components/Button";
import Card from "../../../components/Card";
import OptionsSheet from "../../../components/OptionsSheet";
import ScreenHeader from "../../../components/ScreenHeader";
import TextField from "../../../components/TextField";
import { auth } from "../../../services/firebase";
import {
  atualizarUsuarioNoBanco,
  buscarUsuarioPorEmail,
  escutarTiposCertificados,
} from "../../../services/firestore";
import { colors, fonts, radius, spacing } from "../../../theme";
import { formatDateBR, parseIsoDate, toIsoDate } from "../../../utils/calendar";
import { mascararData, parseDataBR } from "../../../utils/formulario";
import { CHAVE_FOTOS_CERTIFICADOS } from "./CertificacoesScreen";

// Alert.alert simples não aparece no Expo Web, então lá usamos o alert do navegador.
function avisar(titulo, mensagem) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

function Campo({ label, children, erro }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

// O brigadista escolhe o tipo de certificado, a foto e a data de vencimento.
// Se vier um `tipoCertificadoId` nos params, a tela abre para atualizar esse certificado.
export default function EnviarCertificadoScreen({ navigation, route }) {
  const tipoInicial = route?.params?.tipoCertificadoId ?? null;
  const email = auth.currentUser?.email?.toLowerCase();

  const [tipos, setTipos] = useState([]);
  const [tipoId, setTipoId] = useState(tipoInicial);
  const [nomeAtual, setNomeAtual] = useState(null);
  const [foto, setFoto] = useState(null);
  const [vencimento, setVencimento] = useState("");
  const [erros, setErros] = useState({});
  const [mostrarTipos, setMostrarTipos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Só os tipos ativos criados pelo administrador aparecem para escolher.
  useEffect(() => {
    const pararDeEscutar = escutarTiposCertificados((lista) => {
      setTipos(lista.filter((tipo) => tipo.ativo));
    });
    return pararDeEscutar;
  }, []);

  // Ao atualizar um certificado, preenche a data e a foto que já existem.
  useEffect(() => {
    async function carregarExistente() {
      if (!tipoInicial || !email) return;
      try {
        const usuario = await buscarUsuarioPorEmail(email);
        const cert = usuario?.certificados.find(
          (c) => c.tipoCertificadoId === tipoInicial,
        );
        if (cert) {
          setNomeAtual(cert.nomeCertificado);
          setVencimento(formatDateBR(parseIsoDate(cert.dataValidade)));
        }
        const json = await AsyncStorage.getItem(CHAVE_FOTOS_CERTIFICADOS + email);
        if (json !== null) {
          const fotos = JSON.parse(json);
          if (fotos[tipoInicial]) setFoto(fotos[tipoInicial]);
        }
      } catch (e) {
        console.warn("Erro ao carregar o certificado:", e);
      }
    }
    carregarExistente();
  }, []);

  const tipoSelecionado = tipos.find((tipo) => tipo.id === tipoId);
  const nomeTipo = tipoSelecionado?.nome ?? nomeAtual;

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      avisar(
        "Permissão necessária",
        "Permita o acesso à galeria para escolher a foto do certificado.",
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (resultado.canceled) return;

    setFoto(resultado.assets[0].uri);
    setErros({ ...erros, foto: null });
  }

  function validar() {
    const novosErros = {};
    if (!tipoId) novosErros.tipo = "Selecione o tipo de certificado.";
    if (!foto) novosErros.foto = "Escolha a foto do certificado.";
    if (!parseDataBR(vencimento)) {
      novosErros.vencimento = "Informe uma data válida (DD/MM/AAAA).";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;

    setSalvando(true);
    try {
      // 1) Foto: guarda o endereço da imagem no aparelho.
      const json = await AsyncStorage.getItem(CHAVE_FOTOS_CERTIFICADOS + email);
      const fotos = json !== null ? JSON.parse(json) : {};
      await AsyncStorage.setItem(
        CHAVE_FOTOS_CERTIFICADOS + email,
        JSON.stringify({ ...fotos, [tipoId]: foto }),
      );

      // 2) Dados: salva o certificado no perfil do brigadista no Firestore.
      const usuario = await buscarUsuarioPorEmail(email);
      if (!usuario) throw new Error("Usuário não encontrado.");

      const antigo = usuario.certificados.find(
        (c) => c.tipoCertificadoId === tipoId,
      );
      const novo = {
        tipoCertificadoId: tipoId,
        nomeCertificado: tipoSelecionado?.nome ?? antigo?.nomeCertificado ?? "",
        emissor: "Enviado pelo brigadista",
        dataEmissao: toIsoDate(new Date()), // data do envio
        dataValidade: toIsoDate(parseDataBR(vencimento)),
      };
      // Se já existia um certificado desse tipo, o novo substitui o antigo.
      const outros = usuario.certificados.filter(
        (c) => c.tipoCertificadoId !== tipoId,
      );
      await atualizarUsuarioNoBanco(usuario.id, {
        ...usuario,
        certificados: [...outros, novo],
      });

      navigation.goBack();
    } catch (e) {
      avisar("Não foi possível enviar", e.message || "Tente novamente.");
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
            title={tipoInicial ? "Atualizar certificado" : "Enviar certificado"}
            lead="Selecione o tipo, a foto do certificado e a data de vencimento."
            onBack={() => navigation.goBack()}
          />

          <Campo label="Tipo de certificado" erro={erros.tipo}>
            <Pressable
              onPress={() => setMostrarTipos(true)}
              disabled={Boolean(tipoInicial)}
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <Card
                  style={[
                    styles.seletor,
                    erros.tipo && styles.cardErro,
                    pressed && styles.cardPressed,
                  ]}
                >
                                    <Text
                    style={[
                      styles.seletorTexto,
                      !nomeTipo && styles.placeholder,
                    ]}
                  >
                    {nomeTipo ?? "Selecione o tipo"}
                  </Text>
                  <Feather
                    name={tipoInicial ? "lock" : "chevron-down"}
                    size={18}
                    color={colors.textMuted}
                  />
                </Card>
              )}
            </Pressable>
          </Campo>

          <Campo label="Foto do certificado" erro={erros.foto}>
            <Pressable onPress={escolherFoto} accessibilityRole="button">
              {foto ? (
                <Image source={{ uri: foto }} style={styles.foto} />
              ) : (
                <View style={[styles.fotoVazia, erros.foto && styles.cardErro]}>
                  <Feather name="image" size={22} color={colors.primary} />
                  <Text style={styles.fotoVaziaTexto}>
                    Toque para escolher da galeria
                  </Text>
                </View>
              )}
            </Pressable>
            {foto ? (
              <Text style={styles.trocar} onPress={escolherFoto}>
                Trocar foto
              </Text>
            ) : null}
          </Campo>

          <Campo label="Data de vencimento">
            <TextField
              icon="calendar"
              placeholder="DD/MM/AAAA"
              value={vencimento}
              onChangeText={(texto) => {
                setVencimento(mascararData(texto));
                setErros({ ...erros, vencimento: null });
              }}
              error={erros.vencimento}
              keyboardType="number-pad"
              maxLength={10}
            />
          </Campo>

          <View style={styles.acoes}>
            <Button
              title={tipoInicial ? "Salvar alterações" : "Enviar certificado"}
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

      <OptionsSheet
        visible={mostrarTipos}
        title="Tipo de certificado"
        opcoes={tipos.map((tipo) => ({
          value: tipo.id,
          label: tipo.nome,
          descricao: tipo.descricao,
        }))}
        valor={tipoId}
        onSelect={(valor) => {
          setTipoId(valor);
          setErros({ ...erros, tipo: null });
        }}
        onClose={() => setMostrarTipos(false)}
        vazio="O administrador ainda não cadastrou certificações."
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
  erro: {
    marginLeft: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  seletor: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.sm,
  },
  seletorTexto: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  cardErro: {
    borderColor: colors.primary,
  },
  cardPressed: {
    backgroundColor: colors.primaryTint,
  },
  foto: {
    width: "100%",
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.neutralSoft,
  },
  fotoVazia: {
    height: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fotoVaziaTexto: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  trocar: {
    alignSelf: "flex-end",
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  acoes: {
    gap: 10,
    marginTop: 6,
  },
});