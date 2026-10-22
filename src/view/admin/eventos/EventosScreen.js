import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/Button";
import EventCard from "../../../components/EventCard";
import FilterChips from "../../../components/FilterChips";
import TextField from "../../../components/TextField";
import { colors, fonts, spacing } from "../../../theme";
import {
  formatShortDate,
  startOfDay,
  toIsoDate,
} from "../../../utils/calendar";
import {
  RECORRENCIA_LABELS,
  STATUS_EVENTO,
  formatarHorario,
  isRecorrente,
  proximaOcorrencia,
  statusEvento,
} from "../../../utils/eventos";
import { useAdminDados } from "../useAdminDados";

const FILTROS = [
  { key: "todos", label: "Todos", titulo: "Todos os eventos" },
  { key: "proximo", label: "Próximos", titulo: "Próximos eventos" },
  { key: "recorrente", label: "Recorrentes", titulo: "Eventos recorrentes" },
  { key: "encerrado", label: "Encerrados", titulo: "Eventos encerrados" },
];

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Eventos ativos primeiro (pela próxima data), depois os encerrados (mais recentes antes).
function ordenar(a, b) {
  if (a.status === "encerrado" && b.status !== "encerrado") return 1;
  if (b.status === "encerrado" && a.status !== "encerrado") return -1;
  if (a.status === "encerrado") return b.data - a.data;
  return a.data - b.data;
}

function descreverEquipe(quantidade, evento) {
  const equipe = `${quantidade} ${quantidade === 1 ? "brigadista" : "brigadistas"}`;
  if (!isRecorrente(evento)) return equipe;
  return `${equipe} · ${RECORRENCIA_LABELS[evento.recorrencia]}`;
}

export default function EventosScreen({ navigation }) {
  const { eventos, escalasDoEvento } = useAdminDados();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const agora = new Date();
  const termo = normalizar(busca.trim());

  const itens = eventos
    .map((evento) => {
      const status = statusEvento(evento, agora);
      const data =
        status === "encerrado"
          ? startOfDay(evento.dataInicio)
          : proximaOcorrencia(evento, agora);
      const escalas = escalasDoEvento(evento.id);
      const escalados =
        status === "encerrado"
          ? escalas.length
          : escalas.filter((item) => item.data === toIsoDate(data)).length;
      return { evento, status, data, escalados };
    })
    .filter(({ evento, status }) => {
      const bateFiltro = filtro === "todos" || status === filtro;
      const bateBusca =
        !termo ||
        normalizar(evento.nome).includes(termo) ||
        normalizar(evento.local).includes(termo);
      return bateFiltro && bateBusca;
    })
    .sort(ordenar);

  const filtroAtual = FILTROS.find((item) => item.key === filtro);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Eventos</Text>
          <Text style={styles.lead}>Gerencie os eventos da brigada</Text>
        </View>

        <TextField
          icon="search"
          placeholder="Buscar evento"
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
          returnKeyType="search"
        />

        <FilterChips opcoes={FILTROS} valor={filtro} onChange={setFiltro} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{filtroAtual.titulo}</Text>
          <Text style={styles.contagem}>
            {itens.length} {itens.length === 1 ? "evento" : "eventos"}
          </Text>
        </View>

        {itens.length ? (
          <View style={styles.lista}>
            {itens.map(({ evento, status, data, escalados }) => {
              const [dia, mes] = formatShortDate(data).split(" ");
              return (
                <EventCard
                  key={evento.id}
                  dia={dia}
                  mes={mes}
                  titulo={evento.nome}
                  horario={formatarHorario(evento)}
                  local={evento.local}
                  detalhe={descreverEquipe(escalados, evento)}
                  statusLabel={STATUS_EVENTO[status].label}
                  statusTone={STATUS_EVENTO[status].tone}
                  passado={status === "encerrado"}
                  onPress={() =>
                    navigation.navigate("EventoForm", { eventoId: evento.id })
                  }
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Feather name="calendar" size={28} color={colors.textFaint} />
            <Text style={styles.vazioTitulo}>Nenhum evento encontrado</Text>
            <Text style={styles.vazioTexto}>
              {termo
                ? "Tente buscar por outro nome ou local."
                : "Ainda não há eventos nesta categoria."}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <Button
          title="+ Novo evento"
          onPress={() => navigation.navigate("EventoForm")}
        />
      </View>
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
    paddingBottom: 16,
    gap: 14,
  },
  header: {
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  contagem: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  lista: {
    gap: 10,
  },
  vazio: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 40,
  },
  vazioTitulo: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  vazioTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  rodape: {
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
  },
});
