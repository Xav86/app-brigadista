import { useState } from "react";

// Inicializa no mês e ano atuais do sistema (assim como a agenda do administrador).
export function useAgendaMonth() {
  const [{ ano, mes }, setMesVisivel] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });
 /* const [{ ano, mes }, setMesVisivel] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });*/

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
