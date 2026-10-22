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
  const [eventos] = useState(EVENTOS_EXEMPLO);
  const [escalas] = useState(ESCALAS_EXEMPLO);
  const [solicitacoes] = useState(SOLICITACOES_EXEMPLO);

  function buscarEvento(id) {
    return eventos.find((evento) => evento.id === id);
  }

  function buscarBrigadista(id) {
    return BRIGADISTAS_EXEMPLO.find((brigadista) => brigadista.id === id);
  }

  function escalasDoEvento(eventoId) {
    return escalas.filter((item) => item.eventoId === eventoId);
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
      }}
    >
      {children}
    </AdminDadosContext.Provider>
  );
}

export function useAdminDados() {
  return useContext(AdminDadosContext);
}
