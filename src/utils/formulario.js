// Máscaras e conversões usadas nos formulários (datas no padrão brasileiro e horários).

function somenteDigitos(texto = "") {
  return texto.replace(/\D/g, "");
}

// "12102026" -> "12/10/2026" (vai formatando enquanto a pessoa digita)
export function mascararData(texto) {
  const digitos = somenteDigitos(texto).slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

// "0930" -> "09:30"
export function mascararHora(texto) {
  const digitos = somenteDigitos(texto).slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}

// "DD/MM/AAAA" -> Date, ou null se a data não existir (ex.: 31/02/2026).
export function parseDataBR(texto) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto?.trim() ?? "");
  if (!match) return null;

  const [, dia, mes, ano] = match.map(Number);
  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  return existe ? data : null;
}

// "HH:MM" -> minutos desde a meia-noite, ou null se for inválido.
export function parseHora(texto) {
  const match = /^(\d{2}):(\d{2})$/.exec(texto?.trim() ?? "");
  if (!match) return null;

  const horas = Number(match[1]);
  const minutos = Number(match[2]);
  if (horas > 23 || minutos > 59) return null;

  return horas * 60 + minutos;
}

export function combinarDataHora(data, minutos) {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    Math.floor(minutos / 60),
    minutos % 60,
  );
}
