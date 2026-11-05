import { createContext, useContext, useEffect, useState } from "react";

import {
  adicionarEvento,
  atualizarEvento,
  escutarEventos,
  excluirEvento as excluirEventoNoBanco,
} from "../../services/firestore";
import {
  ADMIN_EXEMPLO,
  BRIGADISTAS_EXEMPLO,
  SOLICITACOES_EXEMPLO,
} from "./dadosExemplo";

// Estado compartilhado entre as abas do administrador (Início, Eventos, Agenda).
// Os eventos vêm do Firestore; escalas e solicitações ainda ficam em memória,
// com os dados de exemplo de dadosExemplo.js.
const AdminDadosContext = createContext(null);

export function AdminDadosProvider({ children }) {
  const [eventos, setEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [erroEventos, setErroEventos] = useState(null);
  const [escalas, setEscalas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState(SOLICITACOES_EXEMPLO);

  // Escuta a coleção "eventos": qualquer cadastro, edição ou exclusão já atualiza as telas.
  useEffect(() => {
    const pararDeEscutar = escutarEventos(
      (lista) => {
        setEventos(lista);
        setErroEventos(null);
        setCarregandoEventos(false);
      },
      () => {
        setErroEventos("Não foi possível carregar os eventos.");
        setCarregandoEventos(false);
      },
    );
    return pararDeEscutar;
  }, []);

  function buscarEvento(id) {
    return eventos.find((evento) => evento.id === id);
  }

  function buscarBrigadista(id) {
    return BRIGADISTAS_EXEMPLO.find((brigadista) => brigadista.id === id);
  }

  function escalasDoEvento(eventoId) {
    return escalas.filter((item) => item.eventoId === eventoId);
  }

  // Cria o evento no Firestore quando não há `id`; caso contrário, atualiza o existente.
  async function salvarEvento(id, dados) {
    if (!id) {
      return adicionarEvento({ ...dados, notificacoesAtivas: true });
    }

    const existente = buscarEvento(id);
    return atualizarEvento(id, {
      notificacoesAtivas: existente?.notificacoesAtivas ?? true,
      ...dados,
    });
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

  // Remove o evento do Firestore e as escalas ligadas a ele.
  async function excluirEvento(id) {
    await excluirEventoNoBanco(id);
    setEscalas((atuais) => atuais.filter((item) => item.eventoId !== id));
  }

  return (
    <AdminDadosContext.Provider
      value={{
        admin: ADMIN_EXEMPLO,
        brigadistas: BRIGADISTAS_EXEMPLO,
        eventos,
        carregandoEventos,
        erroEventos,
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
