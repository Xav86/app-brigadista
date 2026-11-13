import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//prof nao passou em sala mas precisa p salvar a foto no banco 
// n vamos usar - import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

import Button from "../../components/Button";
import Card from "../../components/Card";
import StatusPill from "../../components/StatusPill";
import { colors, fonts, radius, spacing } from "../../theme";
import { auth } from "../../services/firebase";
import { buscarUsuarioPorEmail } from "../../services/firestore";

const OPCOES = [
  {
    id: "pessoais",
    icon: "user",
    titulo: "Informações pessoais",
    descricao: "Nome, e-mail e telefone",
    rota: "InformacoesPessoais",
  },
  {
    id: "certificacoes",
    icon: "award",
    titulo: "Certificações",
    descricao: "Suas certificações e validades",
    rota: "Certificacoes",
  },
  {
    id: "notificacoes",
    icon: "bell",
    titulo: "Notificações",
    descricao: "Configure seus avisos",
    rota: "Notificacoes",
  },
];

const CHAVE_FOTO = "@fotoPerfil:";

function emBreve() {
  Alert.alert("Em breve", "Esta funcionalidade ainda será construída.");
}

function OpcaoItem({ opcao, onPress }) {
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
  const [usuario, setUsuario] = useState(null);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
  async function carregarPerfil() {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      const dados = await buscarUsuarioPorEmail(email);
      setUsuario(dados);
      if (dados?.fotoUrl) setFoto(dados.fotoUrl);
    } catch (err) {
      console.warn("Erro ao buscar dados do perfil:", err);
    }
  }
  carregarPerfil();
}, []);

    async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para escolher sua foto de perfil."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled) return;

    try {
      const reduzida = await ImageManipulator.manipulateAsync(
        resultado.assets[0].uri,
        [{ resize: { width: 256, height: 256 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const dataUri = `data:image/jpeg;base64,${reduzida.base64}`;

      await updateDoc(doc(db, "usuarios", usuario.id), { fotoUrl: dataUri });
      setFoto(dataUri);
    } catch (e) {
      console.warn("Erro ao salvar foto:", e);
      Alert.alert("Não foi possível salvar", "Tente novamente.");
    }
  }

  function confirmarSaida() {
    if (Platform.OS === "web") {
      if (window.confirm("Deseja realmente sair da sua conta?")) onLogout();
      return;
    }
    Alert.alert("Sair da conta", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: onLogout },
    ]);
  }

  const nomeExibicao =
    usuario?.nome || auth.currentUser?.displayName || "Brigadista";
  const funcaoExibicao =
    usuario?.tipoUsuario === "admin" ? "Administrador" : "Brigadista";

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
          <Pressable onPress={escolherFoto} accessibilityRole="button">
            <View style={styles.avatar}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.avatarFoto} />
              ) : (
                <View style={styles.avatarMiolo} />
              )}
            </View>
            <View style={styles.avatarEditar}>
              <Feather name="camera" size={11} color={colors.primary} />
            </View>
          </Pressable>
          <View style={styles.perfilInfo}>
            <Text style={styles.nome}>{nomeExibicao}</Text>
            <View style={styles.pills}>
              <StatusPill label={funcaoExibicao} tone="neutral" />
              <StatusPill label="Ativo" tone="success" />
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
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarEditar: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiolo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  perfilInfo: {
    flex: 1,
    gap: 6,
  },
  nome: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  pills: {
    flexDirection: "row",
    gap: 6,
  },
  lista: {
    gap: 10,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
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