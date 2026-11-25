import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { auth } from "../../services/firebase";
import {
  adicionarEscala,
  adicionarSolicitacao,
  atualizarStatusEscala,
  escutarCompetencia,
  escutarCompetenciaAtual,
  escutarEscalas,
  escutarEventos,
  escutarSolicitacoes,
  escutarTiposCertificados,
  escutarUsuarios,
  responderSolicitacoesNoBanco,
} from "../../services/firestore";
import {
  formatShortDate,
  formatTime,
  getMonthLabel,
  parseIsoDate,
  startOfDay,
  toIsoDate,
} from "../../utils/calendar";
import { formatarHorario, ocorrenciasNoMes } from "../../utils/eventos";
import { TIPOS_CERTIFICADOS_PADRAO } from "../admin/gestao/useBrigadistas";
import { competenciaAberta } from "./agenda/competencia";

const BrigadistaDadosContext = createContext(null);

function montarCompetenciaDeReferencia(mesReferencia, dadosBanco = null) {
  const padrao = competenciaAberta();
  const ref =
    typeof mesReferencia === "string" && /^\d{4}-\d{2}$/.test(mesReferencia)
      ? mesReferencia
      : padrao.mesReferencia;
  const [ano, mesNumero] = ref.split("-").map(Number);
  const mes = mesNumero - 1;
  return {
    ano,
    mes,
    mesReferencia: ref,
    titulo: dadosBanco?.titulo || getMonthLabel(ano, mes),
    agendamentoLiberado: dadosBanco ? Boolean(dadosBanco.agendamentoLiberado) : true,
  };
}

function extrairDiaMes(data) {
  const partes = formatShortDate(data).split(" ");
  return {
    dia: partes[0] || String(data.getDate()).padStart(2, "0"),
    mes: (partes[1] || "").toUpperCase(),
  };
}

function resolverNomesCertificacoes(ids = [], tiposCertificados = []) {
  return ids.map((id) => {
    const encontradoBanco = tiposCertificados.find((t) => t.id === id);
    if (encontradoBanco) return encontradoBanco.nome;
    const encontradoPadrao = TIPOS_CERTIFICADOS_PADRAO.find((t) => t.id === id);
    return encontradoPadrao ? encontradoPadrao.nome : id;
  });
}

export function BrigadistaDadosProvider({ children }) {
  const [authUser, setAuthUser] = useState(() => auth.currentUser);
  const [usuarios, setUsuarios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [tiposCertificados, setTiposCertificados] = useState([]);
  const [escalasBanco, setEscalasBanco] = useState([]);
  const [solicitacoesBanco, setSolicitacoesBanco] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [referenciaCompetencia, setReferenciaCompetencia] = useState(
    () => competenciaAberta().mesReferencia,
  );
  const [competenciaBanco, setCompetenciaBanco] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const pararUsuarios = escutarUsuarios((lista) => {
      setUsuarios(lista);
    });
    const pararEventos = escutarEventos(
      (lista) => {
        setEventos(lista);
        setCarregando(false);
      },
      () => setCarregando(false),
    );
    const pararTipos = escutarTiposCertificados((lista) => {
      setTiposCertificados(lista);
    });
    const pararCompAtual = escutarCompetenciaAtual((ref) => {
      if (ref) setReferenciaCompetencia(ref);
    });

    return () => {
      pararUsuarios();
      pararEventos();
      pararTipos();
      pararCompAtual();
    };
  }, []);

  useEffect(() => {
    if (!referenciaCompetencia) return;
    const pararComp = escutarCompetencia(referenciaCompetencia, (dados) => {
      setCompetenciaBanco(dados);
    });
    return pararComp;
  }, [referenciaCompetencia]);

  const brigadista = useMemo(() => {
    const email = authUser?.email?.trim().toLowerCase();
    const encontrado = email
      ? usuarios.find((u) => u.email?.trim().toLowerCase() === email)
      : null;
    if (encontrado) return encontrado;
    return {
      id: authUser?.uid || "brigadista-local",
      nome:
        authUser?.displayName ||
        (authUser?.email ? authUser.email.split("@")[0] : "Brigadista"),
      email: authUser?.email || "",
      certificados: [],
    };
  }, [authUser, usuarios]);

  useEffect(() => {
    if (!brigadista?.id) return;
    const pararEscalas = escutarEscalas(
      (lista) => setEscalasBanco(lista),
      undefined,
      brigadista.id,
    );
    const pararSolicitacoes = escutarSolicitacoes(
      (lista) => setSolicitacoesBanco(lista),
      undefined,
      brigadista.id,
    );
    return () => {
      pararEscalas();
      pararSolicitacoes();
    };
  }, [brigadista?.id]);

  const competencia = useMemo(
    () => montarCompetenciaDeReferencia(referenciaCompetencia, competenciaBanco),
    [referenciaCompetencia, competenciaBanco],
  );

  // Lista consolidada de escalas do brigadista (vindas da coleção "escalas" + solicitações vinculadas a eventos)
  const minhasEscalas = useMemo(() => {
    const hoje = startOfDay(new Date());
    const mapa = new Map();

    for (const esc of escalasBanco) {
      if (esc.status === "recusado") continue;
      const evento = eventos.find((e) => e.id === esc.eventoId);
      const dataObj = parseIsoDate(esc.data);
      const { dia, mes } = extrairDiaMes(dataObj);
      const horario = evento
        ? formatarHorario(evento)
        : formatTime(esc.dataHoraServico);
      const passado = dataObj < hoje;
      const statusExibicao =
        passado && esc.status === "confirmado" ? "concluido" : esc.status;

      const chave = `${esc.eventoId}_${esc.data}`;
      mapa.set(chave, {
        id: esc.id,
        eventoId: esc.eventoId,
        dataIso: esc.data,
        dataObj,
        dia,
        mes,
        titulo: evento?.nome || esc.eventoNome || "Evento da Brigada",
        descricao: evento?.descricao || "",
        horario,
        local: evento?.local || esc.eventoLocal || "Local a definir",
        status: statusExibicao,
        certificacoes: resolverNomesCertificacoes(
          evento?.certificacoes ?? [],
          tiposCertificados,
        ),
      });
    }

    // Se houver solicitação vinculada a evento que ainda não gerou documento em "escalas", inclui também
    for (const sol of solicitacoesBanco) {
      if (sol.status === "recusada" || !sol.eventoId) continue;
      const evento = eventos.find((e) => e.id === sol.eventoId);
      for (const dataIso of sol.datas) {
        const chave = `${sol.eventoId}_${dataIso}`;
        if (mapa.has(chave)) continue;
        const dataObj = parseIsoDate(dataIso);
        const { dia, mes } = extrairDiaMes(dataObj);
        const passado = dataObj < hoje;
        const statusBase = sol.status === "aprovada" ? "confirmado" : "pendente";
        const statusExibicao =
          passado && statusBase === "confirmado" ? "concluido" : statusBase;

        mapa.set(chave, {
          id: sol.id,
          eventoId: sol.eventoId,
          dataIso,
          dataObj,
          dia,
          mes,
          titulo: evento?.nome || sol.eventoNome || "Evento da Brigada",
          descricao: evento?.descricao || "",
          horario: evento
            ? formatarHorario(evento)
            : sol.eventoHorario || "08:00 - 12:00",
          local: evento?.local || sol.eventoLocal || "Local a definir",
          status: statusExibicao,
          certificacoes: resolverNomesCertificacoes(
            evento?.certificacoes ?? [],
            tiposCertificados,
          ),
        });
      }
    }

    return Array.from(mapa.values());
  }, [escalasBanco, solicitacoesBanco, eventos, tiposCertificados]);

  const escalasProximas = useMemo(() => {
    const hoje = startOfDay(new Date());
    return minhasEscalas
      .filter((item) => item.dataObj >= hoje)
      .sort((a, b) => a.dataObj - b.dataObj);
  }, [minhasEscalas]);

  const escalasAnteriores = useMemo(() => {
    const hoje = startOfDay(new Date());
    return minhasEscalas
      .filter((item) => item.dataObj < hoje)
      .sort((a, b) => b.dataObj - a.dataObj);
  }, [minhasEscalas]);

  // Retorna os eventos que acontecem no mês (ano, mes), cruzando com as escalas/solicitações do brigadista
  function compromissosDoMes(ano, mes) {
    const itens = [];
    const chavesAdicionadas = new Set();

    for (const evento of eventos) {
      const datas = ocorrenciasNoMes(evento, ano, mes);
      for (const dataObj of datas) {
        const dataIso = toIsoDate(dataObj);
        const chave = `${evento.id}_${dataIso}`;
        chavesAdicionadas.add(chave);

        const escalaExistente = escalasBanco.find(
          (esc) => esc.eventoId === evento.id && esc.data === dataIso,
        );
        const solicitacaoEspecifica = solicitacoesBanco.find(
          (sol) =>
            sol.eventoId === evento.id && sol.datas.includes(dataIso),
        );
        const solicitacaoDia = solicitacoesBanco.find(
          (sol) => !sol.eventoId && sol.datas.includes(dataIso),
        );
        const solicitacao = solicitacaoEspecifica || solicitacaoDia;

        let status = "disponivel";
        if (
          escalaExistente?.status === "confirmado" ||
          solicitacao?.status === "aprovada"
        ) {
          status = "confirmado";
        } else if (
          escalaExistente?.status === "pendente" ||
          solicitacao?.status === "pendente"
        ) {
          status = "pendente";
        } else if (
          escalaExistente?.status === "recusado" ||
          solicitacao?.status === "recusada"
        ) {
          status = "recusado";
        }

        const { dia, mes: mesCurto } = extrairDiaMes(dataObj);
        itens.push({
          id: chave,
          eventoId: evento.id,
          data: dataObj,
          dataIso,
          dia,
          mes: mesCurto,
          titulo: evento.nome,
          descricao: evento.descricao || "Sem descrição disponível.",
          horario: formatarHorario(evento),
          local: evento.local,
          status,
          certificacoes: resolverNomesCertificacoes(
            evento.certificacoes ?? [],
            tiposCertificados,
          ),
        });
      }
    }

    // Inclui também escalas do brigadista no mês cujos eventos eventualmente não estejam na lista acima
    for (const esc of escalasBanco) {
      if (esc.status === "recusado") continue;
      const dataObj = parseIsoDate(esc.data);
      if (dataObj.getFullYear() !== ano || dataObj.getMonth() !== mes) continue;
      const chave = `${esc.eventoId}_${esc.data}`;
      if (chavesAdicionadas.has(chave)) continue;

      const { dia, mes: mesCurto } = extrairDiaMes(dataObj);
      itens.push({
        id: chave,
        eventoId: esc.eventoId,
        data: dataObj,
        dataIso: esc.data,
        dia,
        mes: mesCurto,
        titulo: esc.eventoNome || "Evento da Brigada",
        descricao: "Escala de serviço da brigada.",
        horario: formatTime(esc.dataHoraServico),
        local: esc.eventoLocal || "Local a definir",
        status: esc.status === "confirmado" ? "confirmado" : "pendente",
        certificacoes: [],
      });
    }

    return itens.sort((a, b) => a.data - b.data);
  }

  async function enviarSolicitacaoDisponibilidade(datas, competenciaInfo) {
    const compId =
      competenciaInfo?.mesReferencia ||
      competencia.mesReferencia ||
      datas[0]?.slice(0, 7) ||
      competenciaAberta().mesReferencia;

    return adicionarSolicitacao({
      brigadistaId: brigadista.id,
      brigadistaNome: brigadista.nome || "Brigadista",
      datas,
      competenciaId: compId,
      eventoId: null,
      eventoNome: null,
      eventoLocal: null,
      eventoHorario: null,
      status: "pendente",
      motivo: null,
      enviadaEm: new Date(),
      respondidaEm: null,
    });
  }

  async function responderPresencaEvento(evento, resposta) {
    const eventoIdReal = evento.eventoId || evento.id;
    const dataIso = evento.data;
    const compId = dataIso.slice(0, 7);
    const eventoBanco = eventos.find((e) => e.id === eventoIdReal);

    const dataHoraServico = parseIsoDate(dataIso);
    if (eventoBanco?.dataInicio instanceof Date) {
      dataHoraServico.setHours(
        eventoBanco.dataInicio.getHours(),
        eventoBanco.dataInicio.getMinutes(),
        0,
        0,
      );
    } else {
      dataHoraServico.setHours(8, 0, 0, 0);
    }

    const escalaExistente = escalasBanco.find(
      (esc) => esc.eventoId === eventoIdReal && esc.data === dataIso,
    );
    // Pedido deste evento/dia que o admin ainda não respondeu.
    const pedidoAberto = solicitacoesBanco.find(
      (sol) =>
        sol.eventoId === eventoIdReal &&
        sol.datas.includes(dataIso) &&
        sol.status === "pendente",
    );

    // Evita pedidos repetidos na tela de Solicitações do admin.
    if (resposta === "disponivel") {
      if (escalaExistente?.status === "confirmado") {
        throw new Error("Você já está confirmado neste evento.");
      }
      if (escalaExistente?.status === "pendente" || pedidoAberto) {
        throw new Error(
          "Você já enviou sua disponibilidade para este evento. Aguarde a resposta do administrador.",
        );
      }
    } else if (escalaExistente?.status === "recusado" && !pedidoAberto) {
      throw new Error("Você já informou que não pode participar deste evento.");
    }

    if (resposta === "disponivel") {
      await adicionarSolicitacao({
        brigadistaId: brigadista.id,
        brigadistaNome: brigadista.nome || "Brigadista",
        datas: [dataIso],
        competenciaId: compId,
        eventoId: eventoIdReal,
        eventoNome: evento.titulo,
        eventoLocal: evento.local,
        eventoHorario: evento.horario,
        status: "pendente",
        motivo: null,
        enviadaEm: new Date(),
        respondidaEm: null,
      });

      if (escalaExistente) {
        if (escalaExistente.status === "recusado") {
          await atualizarStatusEscala(escalaExistente.id, "pendente");
        }
      } else {
        await adicionarEscala({
          competenciaId: compId,
          eventoId: eventoIdReal,
          brigadistaId: brigadista.id,
          eventoNome: evento.titulo,
          eventoLocal: evento.local,
          brigadistaNome: brigadista.nome || "Brigadista",
          dataHoraServico,
          status: "pendente",
          origem: "auto_agendamento",
          notificacao: {
            enviarPush: true,
            enviada: false,
          },
          historicoAlteracao: {
            dataAnterior: null,
            alteradoPorAdminId: null,
          },
        });
      }
    } else {
      if (escalaExistente) {
        await atualizarStatusEscala(escalaExistente.id, "recusado");
      }
      // Se já existia um pedido esperando o admin, ele é fechado em vez de criar outro.
      if (pedidoAberto) {
        await responderSolicitacoesNoBanco(
          [pedidoAberto.id],
          "recusada",
          "Indisponibilidade informada pelo brigadista",
        );
        return;
      }
      await adicionarSolicitacao({
        brigadistaId: brigadista.id,
        brigadistaNome: brigadista.nome || "Brigadista",
        datas: [dataIso],
        competenciaId: compId,
        eventoId: eventoIdReal,
        eventoNome: evento.titulo,
        eventoLocal: evento.local,
        eventoHorario: evento.horario,
        status: "recusada",
        motivo: "Indisponibilidade informada pelo brigadista",
        enviadaEm: new Date(),
        respondidaEm: new Date(),
      });
    }
  }

  return (
    <BrigadistaDadosContext.Provider
      value={{
        brigadista,
        eventos,
        escalas: minhasEscalas,
        escalasProximas,
        escalasAnteriores,
        solicitacoes: solicitacoesBanco,
        competencia,
        carregando,
        compromissosDoMes,
        enviarSolicitacaoDisponibilidade,
        responderPresencaEvento,
      }}
    >
      {children}
    </BrigadistaDadosContext.Provider>
  );
}

export function useBrigadistaDados() {
  return useContext(BrigadistaDadosContext);
}
