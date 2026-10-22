import { createContext, useContext, useEffect, useState } from "react";

import {
  adicionarUsuario,
  atualizarUsuarioNoBanco,
  escutarTiposCertificados,
  escutarUsuarios,
} from "../../../services/firestore";

export const TIPOS_CERTIFICADOS_PADRAO = [
  {
    id: "nr-23",
    nome: "NR-23",
    cargaHoraria: 8,
    descricao: "Proteção Contra Incêndios",
    validadeMeses: 12,
    ativo: true,
  },
  {
    id: "primeiros-socorros",
    nome: "Primeiros Socorros",
    cargaHoraria: 16,
    descricao: "Atendimento Pré-Hospitalar Básico",
    validadeMeses: 12,
    ativo: true,
  },
  {
    id: "combate-incendio",
    nome: "Combate a Incêndio",
    cargaHoraria: 12,
    descricao: "Prevenção e Combate a Princípios de Incêndio",
    validadeMeses: 24,
    ativo: true,
  },
];

export const ESPECIALIDADES_LABELS = {
  nenhum: "Nenhuma",
  bombeiro_civil: "Bombeiro Civil",
  bombeiro_militar: "Bombeiro Militar",
  enfermeiro: "Enfermeiro(a)",
  medico: "Médico(a)",
  policial: "Policial",
  militar: "Militar",
};

export function extrairIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "BR";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const BrigadistasContext = createContext(null);

export function BrigadistasProvider({ children }) {
  const [brigadistas, setBrigadistas] = useState([]);
  const [tiposCertificados, setTiposCertificados] = useState(
    TIPOS_CERTIFICADOS_PADRAO,
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const unsubUsuarios = escutarUsuarios(
      (lista) => {
        setBrigadistas(lista);
        setLoading(false);
        setErro(null);
      },
      (err) => {
        setErro(err?.message || "Erro ao carregar brigadistas do Firebase.");
        setLoading(false);
      },
    );

    const unsubTipos = escutarTiposCertificados((lista) => {
      const ativos = lista.filter((t) => t.ativo);
      if (ativos.length > 0) {
        setTiposCertificados(ativos);
      } else {
        setTiposCertificados(TIPOS_CERTIFICADOS_PADRAO);
      }
    });

    return () => {
      unsubUsuarios();
      unsubTipos();
    };
  }, []);

  async function adicionarBrigadista(dadosUsuario) {
    return await adicionarUsuario(dadosUsuario);
  }

  async function atualizarBrigadista(id, dadosUsuario) {
    return await atualizarUsuarioNoBanco(id, dadosUsuario);
  }

  return (
    <BrigadistasContext.Provider
      value={{
        brigadistas,
        tiposCertificados,
        loading,
        erro,
        adicionarBrigadista,
        atualizarBrigadista,
      }}
    >
      {children}
    </BrigadistasContext.Provider>
  );
}

export function useBrigadistas() {
  return useContext(BrigadistasContext);
}
