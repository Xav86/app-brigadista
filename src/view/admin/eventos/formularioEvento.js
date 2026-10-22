import {
  formatDateBR,
  formatTime,
  parseIsoDate,
  startOfDay,
  toIsoDate,
} from "../../../utils/calendar";
import { isRecorrente } from "../../../utils/eventos";
import {
  combinarDataHora,
  parseDataBR,
  parseHora,
} from "../../../utils/formulario";

export const TAMANHO_MAXIMO_DESCRICAO = 300;

export const REGRA_SEM_RECORRENCIA = {
  recorrencia: "nenhuma",
  diasSemana: [],
  terminaEm: null, // ISO "AAAA-MM-DD" para poder ir e voltar pelos params da navegação
};

export function camposIniciais(evento) {
  if (!evento) {
    return {
      nome: "",
      descricao: "",
      local: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      certificacoes: [],
      regra: REGRA_SEM_RECORRENCIA,
    };
  }

  return {
    nome: evento.nome,
    descricao: evento.descricao ?? "",
    local: evento.local,
    data: formatDateBR(evento.dataInicio),
    horaInicio: formatTime(evento.dataInicio),
    horaFim: formatTime(evento.dataFim),
    certificacoes: evento.certificacoes ?? [],
    regra: {
      recorrencia: evento.recorrencia ?? "nenhuma",
      diasSemana: evento.diasSemana ?? [],
      terminaEm: evento.terminaEm ? toIsoDate(evento.terminaEm) : null,
    },
  };
}

// Valida os campos do formulário e, se estiver tudo certo, monta o evento no formato
// usado pelo app (mesmos nomes do modelo Evento em src/models).
export function validarFormularioEvento(
  campos,
  { editando = false, hoje = new Date() } = {},
) {
  const erros = {};
  const nome = campos.nome.trim();
  const local = campos.local.trim();

  if (!nome) erros.nome = "Informe o nome do evento";
  else if (nome.length < 3)
    erros.nome = "O nome precisa ter pelo menos 3 letras";

  if (!local) erros.local = "Informe o local do evento";

  if (campos.descricao.length > TAMANHO_MAXIMO_DESCRICAO) {
    erros.descricao = `Use no máximo ${TAMANHO_MAXIMO_DESCRICAO} caracteres`;
  }

  const data = parseDataBR(campos.data);
  if (!data) {
    erros.data = "Informe uma data válida (DD/MM/AAAA)";
  } else if (!editando && data < startOfDay(hoje)) {
    erros.data = "A data não pode estar no passado";
  }

  const inicio = parseHora(campos.horaInicio);
  const fim = parseHora(campos.horaFim);
  if (inicio === null) erros.horaInicio = "Hora inválida";
  if (fim === null) erros.horaFim = "Hora inválida";
  if (inicio !== null && fim !== null && fim <= inicio) {
    erros.horaFim = "Deve ser depois do início";
  }

  const { regra } = campos;
  if (regra.recorrencia === "semanal" && regra.diasSemana.length === 0) {
    erros.regra = "Escolha pelo menos um dia da semana";
  }
  const terminaEm = regra.terminaEm ? parseIsoDate(regra.terminaEm) : null;
  if (data && terminaEm && terminaEm < data) {
    erros.regra = "A recorrência termina antes da data do evento";
  }

  if (Object.keys(erros).length > 0) return { erros, evento: null };

  const recorrente = isRecorrente(regra);
  return {
    erros,
    evento: {
      nome,
      descricao: campos.descricao.trim(),
      local,
      dataInicio: combinarDataHora(data, inicio),
      dataFim: combinarDataHora(data, fim),
      tipo: recorrente ? "recorrente" : "esporadico",
      recorrencia: regra.recorrencia,
      diasSemana: regra.recorrencia === "semanal" ? regra.diasSemana : [],
      terminaEm: recorrente ? terminaEm : null,
      certificacoes: campos.certificacoes,
    },
  };
}
