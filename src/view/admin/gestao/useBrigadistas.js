import { createContext, useContext, useEffect, useState } from "react";

import {
  adicionarTipoCertificado,
  adicionarUsuario,
  atualizarTipoCertificado,
  atualizarUsuarioNoBanco,
  escutarTiposCertificados,
  escutarUsuarios,
} from "../../../services/firestore";


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
  const [tiposCertificados, setTiposCertificados] = useState([]);

    // todos os tipos cadastrados no firestore (ativos e inativos) para a tela de certificacoes.
  const [tiposCadastrados, setTiposCadastrados] = useState([]);

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

      setTiposCadastrados(lista); 

      setTiposCertificados(lista.filter((t) => t.ativo));
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

  // cria o tipo de certificado quando nao ha 'id',caso contrario atualiza o existente
  async function salvarTipoCertificado(id, dados) {
    if (!id) {
      return await adicionarTipoCertificado(dados);
    }
    return await atualizarTipoCertificado(id, dados);
  }

  return (
    <BrigadistasContext.Provider
            value={{
        brigadistas,
        tiposCertificados,
        tiposCadastrados,
        salvarTipoCertificado,   
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
