import {
  addDays,
  addMonths,
  formatTime,
  getWeekdayName,
  startOfDay,
} from "./calendar";

export const RECORRENCIA_LABELS = {
  nenhuma: "Não repetir",
  diario: "Diário",
  semanal: "Semanal",
  mensal: "Mensal",
  trimestral: "A cada 3 meses",
  semestral: "A cada 6 meses",
  anual: "Anual",
};

const PASSO_EM_MESES = {
  mensal: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

// Evita laço infinito se a regra de recorrência nunca bater (ex.: dias da semana vazios).
const MAX_ITERACOES = 3660;

export function isRecorrente(evento) {
  return Boolean(evento.recorrencia) && evento.recorrencia !== "nenhuma";
}

function diaDaOcorrencia(base, recorrencia, indice) {
  if (recorrencia === "diario") return addDays(base, indice);
  if (recorrencia === "semanal") return addDays(base, indice * 7);
  return addMonths(base, indice * PASSO_EM_MESES[recorrencia]);
}

// Lista os dias em que o evento acontece, a partir de `aPartirDe` (inclusive).
// Para "semanal" com `diasSemana` (0 = domingo), percorre dia a dia e filtra pelos dias marcados.
export function gerarOcorrencias(evento, { aPartirDe, quantidade = 10 } = {}) {
  const base = startOfDay(evento.dataInicio);
  const limiteInferior = aPartirDe ? startOfDay(aPartirDe) : base;
  const fim = evento.terminaEm ? startOfDay(evento.terminaEm) : null;

  if (!isRecorrente(evento)) {
    return base >= limiteInferior ? [base] : [];
  }

  const diasSemana =
    evento.recorrencia === "semanal" && evento.diasSemana?.length
      ? evento.diasSemana
      : null;

  const datas = [];
  for (let i = 0; datas.length < quantidade && i < MAX_ITERACOES; i++) {
    const data = diasSemana
      ? addDays(base, i)
      : diaDaOcorrencia(base, evento.recorrencia, i);

    if (fim && data > fim) break;
    if (data < limiteInferior) continue;
    if (diasSemana && !diasSemana.includes(data.getDay())) continue;

    datas.push(data);
  }

  return datas;
}

export function proximaOcorrencia(evento, agora = new Date()) {
  if (!isRecorrente(evento)) {
    return evento.dataFim >= agora ? startOfDay(evento.dataInicio) : null;
  }
  return (
    gerarOcorrencias(evento, { aPartirDe: agora, quantidade: 1 })[0] ?? null
  );
}

export function statusEvento(evento, agora = new Date()) {
  if (!proximaOcorrencia(evento, agora)) return "encerrado";
  return isRecorrente(evento) ? "recorrente" : "proximo";
}

export const STATUS_EVENTO = {
  proximo: { label: "Próximo", tone: "success" },
  recorrente: { label: "Recorrente", tone: "warning" },
  encerrado: { label: "Encerrado", tone: "neutral" },
};

export function formatarHorario(evento) {
  return `${formatTime(evento.dataInicio)} - ${formatTime(evento.dataFim)}`;
}

// "Semanal • Segunda-feira", "Mensal", "Não repetir"
export function descreverRecorrencia(evento) {
  const label = RECORRENCIA_LABELS[evento.recorrencia ?? "nenhuma"];
  if (evento.recorrencia !== "semanal") return label;

  const dias = evento.diasSemana?.length
    ? evento.diasSemana
    : [evento.dataInicio.getDay()];
  const nomes = [...dias].sort((a, b) => a - b).map(getWeekdayName);

  return `${label} • ${nomes.join(", ")}`;
}
