import { createContext, useContext, useState } from "react";

import {
  ADMIN_EXEMPLO,
  BRIGADISTAS_EXEMPLO,
  ESCALAS_EXEMPLO,
  EVENTOS_EXEMPLO,
  SOLICITACOES_EXEMPLO,
} from "./dadosExemplo";

// Estado compartilhado entre as abas do administrador (Início, Eventos, Agenda).
// Por enquanto fica só em memória, com os dados de exemplo de dadosExemplo.js.
const AdminDadosContext = createContext(null);

export function AdminDadosProvider({ children }) {
  const [eventos, setEventos] = useState(EVENTOS_EXEMPLO);
  const [escalas, setEscalas] = useState(ESCALAS_EXEMPLO);
  const [solicitacoes, setSolicitacoes] = useState(SOLICITACOES_EXEMPLO);

  function buscarEvento(id) {
    return eventos.find((evento) => evento.id === id);
  }

  function buscarBrigadista(id) {
    return BRIGADISTAS_EXEMPLO.find((brigadista) => brigadista.id === id);
  }

  function escalasDoEvento(eventoId) {
    return escalas.filter((item) => item.eventoId === eventoId);
  }

  // Cria o evento quando não há `id`; caso contrário, atualiza o existente.
  function salvarEvento(id, dados) {
    if (!id) {
      const novo = { ...dados, id: `e${Date.now()}`, notificacoesAtivas: true };
      setEventos((atuais) => [...atuais, novo]);
      return novo;
    }

    setEventos((atuais) =>
      atuais.map((evento) =>
        evento.id === id ? { ...evento, ...dados } : evento,
      ),
    );
    return { ...buscarEvento(id), ...dados };
  }

  // Escala os brigadistas no evento para o dia informado (agendamento manual do admin).
  function adicionarEscalas(eventoId, dataIso, brigadistaIds) {
    const criadas = brigadistaIds.map((brigadistaId, indice) => ({
      id: `s${Date.now()}-${indice}`,
      eventoId,
      brigadistaId,
      data: dataIso,
      status: "confirmado",
      origem: "manual_admin",
    }));
    setEscalas((atuais) => [...atuais, ...criadas]);
    return criadas;
  }

  // Aprova ou recusa uma ou mais solicitações de disponibilidade de uma vez.
  function responderSolicitacoes(ids, status, motivo = null) {
    setSolicitacoes((atuais) =>
      atuais.map((pedido) =>
        ids.includes(pedido.id)
          ? { ...pedido, status, motivo, respondidaEm: new Date() }
          : pedido,
      ),
    );
  }

  // Remove o evento e as escalas ligadas a ele.
  function excluirEvento(id) {
    setEventos((atuais) => atuais.filter((evento) => evento.id !== id));
    setEscalas((atuais) => atuais.filter((item) => item.eventoId !== id));
  }

  return (
    <AdminDadosContext.Provider
      value={{
        admin: ADMIN_EXEMPLO,
        brigadistas: BRIGADISTAS_EXEMPLO,
        eventos,
        escalas,
        solicitacoes,
        buscarEvento,
        buscarBrigadista,
        escalasDoEvento,
        salvarEvento,
        excluirEvento,
        adicionarEscalas,
        responderSolicitacoes,
      }}
    >
      {children}
    </AdminDadosContext.Provider>
  );
}

export function useAdminDados() {
  return useContext(AdminDadosContext);
}
