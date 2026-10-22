import {
  getMonthLabel,
  parseIsoDate,
  startOfDay,
} from "../../../utils/calendar";

// Máximo de dias que o brigadista pode marcar em uma solicitação.
export const LIMITE_DIAS_POR_SOLICITACAO = 10;

// Enquanto a competência não vem do Firebase (coleção "competencias"), considera aberto
// o agendamento do mês seguinte ao atual, que é como a escala da brigada é montada.
export function competenciaAberta(hoje = new Date()) {
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();
  return {
    ano,
    mes,
    titulo: getMonthLabel(ano, mes),
    mesReferencia: `${ano}-${String(mes + 1).padStart(2, "0")}`,
  };
}

export function diaPermitido(iso, competencia, hoje = new Date()) {
  const data = parseIsoDate(iso);
  return (
    data.getFullYear() === competencia.ano &&
    data.getMonth() === competencia.mes &&
    data >= startOfDay(hoje)
  );
}

// Devolve a mensagem de erro da seleção, ou null se puder enviar.
export function validarSelecao(datas, competencia, hoje = new Date()) {
  if (datas.length === 0) return "Selecione pelo menos um dia.";
  if (datas.length > LIMITE_DIAS_POR_SOLICITACAO) {
    return `Você pode enviar no máximo ${LIMITE_DIAS_POR_SOLICITACAO} dias por vez.`;
  }
  if (datas.some((iso) => !diaPermitido(iso, competencia, hoje))) {
    return `Escolha apenas dias de ${competencia.titulo.toLowerCase()}.`;
  }
  return null;
}
