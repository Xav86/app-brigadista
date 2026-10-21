const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const DIAS_SEMANA_CURTOS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const DIAS_SEMANA_LONGOS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function pad2(numero) {
  return String(numero).padStart(2, "0");
}

export function toIsoDate(data) {
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

export function parseIsoDate(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function getMonthLabel(ano, mes) {
  return `${MESES[mes]} ${ano}`;
}

export function formatFullDate(data) {
  return `${pad2(data.getDate())} de ${MESES[data.getMonth()].toLowerCase()} de ${data.getFullYear()}`;
}

export function formatShortDate(data) {
  return `${pad2(data.getDate())} ${MESES[data.getMonth()].slice(0, 3).toUpperCase()}`;
}

export function getWeekdayLabel(data) {
  return DIAS_SEMANA_LONGOS[data.getDay()];
}

// Semanas (domingo a sábado) que cobrem o mês, sem dias do mês seguinte sobrando.
export function getMonthWeeks(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const inicio = new Date(ano, mes, 1 - primeiroDia.getDay());
  const fim = new Date(ano, mes, ultimoDia.getDate() + (6 - ultimoDia.getDay()));

  const semanas = [];
  let semanaAtual = [];

  for (const cursor = new Date(inicio); cursor <= fim; cursor.setDate(cursor.getDate() + 1)) {
    semanaAtual.push({ data: new Date(cursor), noMesAtual: cursor.getMonth() === mes });
    if (semanaAtual.length === 7) {
      semanas.push(semanaAtual);
      semanaAtual = [];
    }
  }

  return semanas;
}
