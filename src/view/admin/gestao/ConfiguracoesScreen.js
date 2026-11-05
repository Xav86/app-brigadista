import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import appConfig from "../../../../app.json";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import OptionsSheet from "../../../components/OptionsSheet";
import ScreenHeader from "../../../components/ScreenHeader";
import StatusPill from "../../../components/StatusPill";
import { colors, fonts, spacing } from "../../../theme";
import { getMonthLabel } from "../../../utils/calendar";
import {
  escutarCompetencia,
  escutarCompetenciaAtual,
  salvarCompetencia,
  salvarCompetenciaAtual,
} from "../../../services/firestore";
import { competenciaAberta } from "../../brigadista/agenda/competencia";

// Preferências de notificação ficam só neste aparelho (AsyncStorage).
const CHAVE_PREFERENCIAS = "@configuracoesAdmin";

const PREFERENCIAS_PADRAO = {
  notificarAntes: true,
  antecedenciaDias: 1,
};

const OPCOES_ANTECEDENCIA = [
  { value: 1, label: "1 dia antes" },
  { value: 2, label: "2 dias antes" },
  { value: 3, label: "3 dias antes" },
  { value: 7, label: "1 semana antes" },
];

// Monta "AAAA-MM" a partir do ano e do mês (0 a 11).
function mesReferencia(ano, mes) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}`;
}

// O mês atual e os dois seguintes, para o admin escolher qual competência abrir.
function opcoesDeCompetencia(hoje = new Date()) {
  const opcoes = [];
  for (let i = 0; i < 3; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    opcoes.push({
      value: mesReferencia(data.getFullYear(), data.getMonth()),
      label: getMonthLabel(data.getFullYear(), data.getMonth()),
    });
  }
  return opcoes;
}

function tituloDaCompetencia(referencia) {
  const [ano, mes] = referencia.split("-").map(Number);
  return getMonthLabel(ano, mes - 1);
}

// Os brigadistas podem escolher as datas até o dia 20 do mês anterior à competência.
function dataLimiteDaCompetencia(referencia) {
  const [ano, mes] = referencia.split("-").map(Number);
  return new Date(ano, mes - 2, 20, 23, 59);
}

// Alert.alert simples não aparece no Expo Web, então lá usamos o alert do navegador.
function avisar(titulo, mensagem) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

// Linha de configuração. Com `onPress` vira um botão com seta; sem ele, mostra
// só o conteúdo da direita (por exemplo um Switch).
function Linha({ titulo, descricao, valor, onPress, children, ultima }) {
  const conteudo = (
    <>
      <View style={styles.linhaTexto}>
        <Text style={styles.linhaTitulo}>{titulo}</Text>
        {descricao ? (
          <Text style={styles.linhaDescricao}>{descricao}</Text>
        ) : null}
      </View>
      {valor ? <Text style={styles.linhaValor}>{valor}</Text> : null}
      {children}
    </>
  );
  const estilo = [styles.linha, !ultima && styles.linhaComBorda];

  if (!onPress) return <View style={estilo}>{conteudo}</View>;

  return (
    <Pressable onPress={onPress} style={estilo}>
      {conteudo}
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ConfiguracoesScreen({ navigation }) {
  const [referenciaAtual, setReferenciaAtual] = useState(null);
  const [competencia, setCompetencia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_PADRAO);
  const [seletor, setSeletor] = useState(null); // "competencia" | "antecedencia" | null

  // Qual mês está aberto para os brigadistas. Se ninguém escolheu ainda, usa o próximo mês.
  useEffect(() => {
    const pararDeEscutar = escutarCompetenciaAtual(
      (referencia) => {
        setReferenciaAtual(referencia ?? competenciaAberta().mesReferencia);
      },
      () => {
        setReferenciaAtual(competenciaAberta().mesReferencia);
        setCarregando(false);
      },
    );
    return pararDeEscutar;
  }, []);

  // Dados da competência escolhida (aberta ou fechada para solicitações).
  useEffect(() => {
    if (!referenciaAtual) return;
    const pararDeEscutar = escutarCompetencia(
      referenciaAtual,
      (dados) => {
        setCompetencia(dados);
        setCarregando(false);
      },
      () => setCarregando(false),
    );
    return pararDeEscutar;
  }, [referenciaAtual]);

  // Carrega as preferências salvas no aparelho quando a tela abre.
  useEffect(() => {
    async function carregarPreferencias() {
      try {
        const json = await AsyncStorage.getItem(CHAVE_PREFERENCIAS);
        if (json !== null) {
          setPreferencias({ ...PREFERENCIAS_PADRAO, ...JSON.parse(json) });
        }
      } catch (e) {
        // Se der erro na leitura, a tela continua com as preferências padrão.
      }
    }
    carregarPreferencias();
  }, []);

  async function alterarPreferencia(campo, valor) {
    const novas = { ...preferencias, [campo]: valor };
    setPreferencias(novas);
    try {
      await AsyncStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(novas));
    } catch (e) {
      avisar("Não foi possível salvar", "Tente novamente.");
    }
  }

  // Grava a competência no Firestore com o agendamento aberto ou fechado.
  async function gravarCompetencia(referencia, agendamentoLiberado) {
    try {
      setSalvando(true);
      await salvarCompetencia({
        mesReferencia: referencia,
        titulo: tituloDaCompetencia(referencia),
        agendamentoLiberado,
        dataLimiteEscolha: dataLimiteDaCompetencia(referencia),
      });
    } catch (erro) {
      avisar("Não foi possível salvar", erro.message);
    } finally {
      setSalvando(false);
    }
  }

  async function trocarCompetencia(referencia) {
    if (referencia === referenciaAtual) return;
    try {
      setSalvando(true);
      await salvarCompetenciaAtual(referencia);
      await gravarCompetencia(referencia, true);
    } catch (erro) {
      avisar("Não foi possível alterar", erro.message);
    } finally {
      setSalvando(false);
    }
  }

  const aberta = Boolean(competencia?.agendamentoLiberado);
  const antecedencia = OPCOES_ANTECEDENCIA.find(
    (opcao) => opcao.value === preferencias.antecedenciaDias,
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Configurações"
          lead="Gerencie agendamentos e preferências do app."
          onBack={() => navigation.goBack()}
        />

        <Text style={styles.secao}>Agendamentos</Text>
        <Card style={styles.card}>
          {carregando ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : (
            <>
              <View style={[styles.linha, styles.linhaComBorda]}>
                <View style={styles.linhaTexto}>
                  <Text style={styles.linhaDescricao}>Competência atual</Text>
                  <Text style={styles.competencia}>
                    {tituloDaCompetencia(referenciaAtual)} •{" "}
                    {aberta ? "Aberta" : "Fechada"}
                  </Text>
                </View>
                <StatusPill
                  label={aberta ? "Aberta" : "Fechada"}
                  tone={aberta ? "success" : "neutral"}
                />
              </View>

              <Linha
                titulo="Permitir solicitações"
                descricao="Receber disponibilidades dos brigadistas."
                ultima
              >
                <Switch
                  value={aberta}
                  onValueChange={(valor) =>
                    gravarCompetencia(referenciaAtual, valor)
                  }
                  disabled={salvando}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </Linha>

              <Button
                title="Alterar competência"
                variant="outline"
                onPress={() => setSeletor("competencia")}
                loading={salvando}
                style={styles.botao}
              />
            </>
          )}
        </Card>

        <Text style={styles.secao}>Notificações</Text>
        <Card style={styles.card}>
          <Linha
            titulo="Notificar antes das escalas"
            descricao="Enviar um lembrete para a equipe."
          >
            <Switch
              value={preferencias.notificarAntes}
              onValueChange={(valor) =>
                alterarPreferencia("notificarAntes", valor)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Linha>
          {preferencias.notificarAntes ? (
            <Linha
              titulo="Antecedência"
              valor={antecedencia?.label}
              onPress={() => setSeletor("antecedencia")}
            />
          ) : null}
          <Linha
            titulo="Preferências gerais"
            descricao="Avisos, atualizações e canais de envio."
            onPress={() =>
              avisar(
                "Preferências gerais",
                "Os avisos são enviados por notificação no aplicativo.",
              )
            }
            ultima
          />
        </Card>

        <Text style={styles.secao}>Sistema</Text>
        <Card style={styles.card}>
          <Linha
            titulo="Idioma"
            valor="Português (Brasil)"
            onPress={() =>
              avisar(
                "Idioma",
                "Por enquanto o app está disponível só em português.",
              )
            }
          />
          <Linha
            titulo="Ajuda e suporte"
            descricao="Dúvidas frequentes e contato."
            onPress={() =>
              avisar(
                "Ajuda e suporte",
                "Em caso de dúvidas, fale com a coordenação da brigada.",
              )
            }
          />
          <Linha
            titulo="Sobre o aplicativo"
            valor={`Versão ${appConfig.expo.version}`}
            onPress={() =>
              avisar(
                appConfig.expo.name,
                `Versão ${appConfig.expo.version}\nGerenciamento de escalas da brigada.`,
              )
            }
            ultima
          />
        </Card>
      </ScrollView>

      <OptionsSheet
        visible={seletor === "competencia"}
        title="Abrir competência"
        opcoes={opcoesDeCompetencia()}
        valor={referenciaAtual}
        onSelect={trocarCompetencia}
        onClose={() => setSeletor(null)}
      />
      <OptionsSheet
        visible={seletor === "antecedencia"}
        title="Antecedência do lembrete"
        opcoes={OPCOES_ANTECEDENCIA}
        valor={preferencias.antecedenciaDias}
        onSelect={(valor) => alterarPreferencia("antecedenciaDias", valor)}
        onClose={() => setSeletor(null)}
      />
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
    gap: 12,
  },
  secao: {
    marginTop: 6,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  card: {
    paddingVertical: 4,
    gap: 4,
  },
  loading: {
    paddingVertical: 24,
  },
  botao: {
    marginBottom: 10,
  },
  competencia: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  linhaComBorda: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  linhaDescricao: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  linhaValor: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
