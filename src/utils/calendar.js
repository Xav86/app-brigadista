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

export function getMonthName(mes) {
  return MESES[mes];
}

export function startOfDay(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function addDays(data, dias) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
}

// Soma meses mantendo o dia; se o mês de destino for mais curto (ex.: 31/01 + 1),
// usa o último dia dele em vez de pular para o mês seguinte.
export function addMonths(data, meses) {
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimoDia = new Date(
    alvo.getFullYear(),
    alvo.getMonth() + 1,
    0,
  ).getDate();
  alvo.setDate(Math.min(data.getDate(), ultimoDia));
  return alvo;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// "12/10/2026"
export function formatDateBR(data) {
  return `${pad2(data.getDate())}/${pad2(data.getMonth() + 1)}/${data.getFullYear()}`;
}

// "05 de outubro"
export function formatDayMonth(data) {
  return `${pad2(data.getDate())} de ${MESES[data.getMonth()].toLowerCase()}`;
}

// "24 out. 2026"
export function formatCompactDate(data) {
  return `${data.getDate()} ${MESES[data.getMonth()].slice(0, 3).toLowerCase()}. ${data.getFullYear()}`;
}

export function formatTime(data) {
  return `${pad2(data.getHours())}:${pad2(data.getMinutes())}`;
}

// 0 = domingo, igual a Date.getDay().
export function getWeekdayName(indice) {
  return DIAS_SEMANA_LONGOS[indice];
}

// "hoje", "ontem", "há 3 dias"
export function formatRelativeDays(data, hoje = new Date()) {
  const dias = Math.round((startOfDay(hoje) - startOfDay(data)) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}
