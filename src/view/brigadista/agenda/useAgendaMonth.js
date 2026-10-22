import { useState } from "react";

// Mês de referência do protótipo (sem backend, os eventos de exemplo são de outubro/2026).
const ANO_INICIAL = 2026;
const MES_INICIAL = 9;

export function useAgendaMonth() {
  const [{ ano, mes }, setMesVisivel] = useState({ ano: ANO_INICIAL, mes: MES_INICIAL });

  function mudarMes(delta) {
    setMesVisivel((atual) => {
      const data = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: data.getFullYear(), mes: data.getMonth() };
    });
  }

  return {
    ano,
    mes,
    mesAnterior: () => mudarMes(-1),
    proximoMes: () => mudarMes(1),
  };
}
