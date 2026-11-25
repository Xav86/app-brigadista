import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { auth } from "../../services/firebase";
import {
  adicionarEscala,
  adicionarEvento,
  atualizarDadosEscala,
  atualizarEvento,
  atualizarStatusEscala,
  escutarEscalas,
  escutarEventos,
  escutarSolicitacoes,
  escutarUsuarios,
  excluirEscala,
  escutarTiposCertificados,
  excluirEvento as excluirEventoNoBanco,
  responderSolicitacoesNoBanco,
} from "../../services/firestore";
import { parseIsoDate, toIsoDate } from "../../utils/calendar";
import { ocorrenciasNoMes } from "../../utils/eventos";

// Estado compartilhado entre as abas do administrador (Início, Eventos, Agenda).
// Todos os dados (eventos, brigadistas, escalas e solicitações) vêm do Firestore em tempo real.
const AdminDadosContext = createContext(null);

const ERRO_CARREGAR =
  "Não foi possível carregar os dados do sistema. Verifique sua conexão e tente novamente.";

function montarDataHoraServico(dataIso, evento) {
  const base = parseIsoDate(dataIso);
  if (evento?.dataInicio instanceof Date) {
    base.setHours(
      evento.dataInicio.getHours(),
      evento.dataInicio.getMinutes(),
      0,
      0,
    );
  } else {
    base.setHours(8, 0, 0, 0);
  }
  return base;
}

export function AdminDadosProvider({ children }) {
  const [eventos, setEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [erroEventos, setErroEventos] = useState(null);
  const [usuariosBanco, setUsuariosBanco] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [tiposCertificados, setTiposCertificados] = useState([]);
  const [erroDados, setErroDados] = useState(null);

  // Se alguma coleção não carregar, avisa o admin uma vez (em vez de só deixar a tela vazia).
  useEffect(() => {
    if (!erroDados) return;
    if (Platform.OS === "web") {
      window.alert(`Erro ao carregar\n${erroDados}`);
    } else {
      Alert.alert("Erro ao carregar", erroDados);
    }
  }, [erroDados]);

  function avisarErroAoCarregar() {
    setErroDados(ERRO_CARREGAR);
  }

  // Escuta a coleção "eventos"
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

  // Escuta a coleção "tipos_certificados": só os tipos ativos cadastrados pelo admin.
  useEffect(() => {
    const pararDeEscutar = escutarTiposCertificados((lista) => {
      setTiposCertificados(lista.filter((tipo) => tipo.ativo));
    }, avisarErroAoCarregar);
    return pararDeEscutar;
  }, []);

  // Escuta a coleção "usuarios" para listar brigadistas reais e identificar o admin logado
  useEffect(() => {
    const pararDeEscutar = escutarUsuarios((lista) => {
      setUsuariosBanco(lista);
    }, avisarErroAoCarregar);
    return pararDeEscutar;
  }, []);

  // Escuta a coleção "escalas" em tempo real
  useEffect(() => {
    const pararDeEscutar = escutarEscalas((lista) => {
      setEscalas(lista);
    }, avisarErroAoCarregar);
    return pararDeEscutar;
  }, []);

  // Escuta a coleção "solicitacoes" em tempo real
  useEffect(() => {
    const pararDeEscutar = escutarSolicitacoes((lista) => {
      setSolicitacoes(lista);
    }, avisarErroAoCarregar);
    return pararDeEscutar;
  }, []);

  const emailLogado = auth.currentUser?.email?.trim().toLowerCase();
  const adminBanco = usuariosBanco.find(
    (u) => u.email?.trim().toLowerCase() === emailLogado,
  );
  const admin = adminBanco
    ? { id: adminBanco.id, nome: adminBanco.nome, email: adminBanco.email }
    : { id: null, nome: "Administrador", email: emailLogado ?? "" };

  // Só os brigadistas ativos entram no painel e no agendamento manual.
  const brigadistas = usuariosBanco.filter(
    (u) => u.tipoUsuario !== "admin" && u.ativo !== false,
  );

  function buscarEvento(id) {
    return eventos.find((evento) => evento.id === id);
  }

  function buscarBrigadista(id) {
    const encontrado = usuariosBanco.find((u) => u.id === id);
    if (encontrado) return encontrado;

    const pedido = solicitacoes.find((s) => s.brigadistaId === id);
    return {
      id: id || "desconhecido",
      nome: pedido?.brigadistaNome || "Brigadista",
      certificados: [],
    };
  }

  // Escalas de um brigadista (todas, inclusive as recusadas), da mais próxima para a mais distante.
  function escalasDoBrigadista(brigadistaId) {
    return escalas
      .filter((item) => item.brigadistaId === brigadistaId)
      .sort((a, b) => a.dataHoraServico - b.dataHoraServico);
  }

  function escalasDoEvento(eventoId) {
    return escalas.filter(
      (item) => item.eventoId === eventoId && item.status !== "recusado",
    );
  }

  // Cria o evento no Firestore quando não há `id`; caso contrário, atualiza o existente.
  async function salvarEvento(id, dados) {
    if (!id) {
      return adicionarEvento({ ...dados, notificacoesAtivas: true });
    }

    const existente = buscarEvento(id);
    const salvo = await atualizarEvento(id, {
      notificacoesAtivas: existente?.notificacoesAtivas ?? true,
      ...dados,
    });
    await atualizarEscalasDoEvento(id, dados);
    return salvo;
  }

  // Depois de editar um evento, as escalas futuras recebem o nome, o local e o
  // horário novos. Se o evento deixou de acontecer em algum dia (mudou a data ou
  // a recorrência), a escala desse dia é apagada para não ficar perdida.
  async function atualizarEscalasDoEvento(eventoId, dados) {
    const hojeIso = toIsoDate(new Date());
    const futuras = escalas.filter(
      (esc) => esc.eventoId === eventoId && esc.data >= hojeIso,
    );

    await Promise.all(
      futuras.map((esc) => {
        const dia = parseIsoDate(esc.data);
        const aindaAcontece = ocorrenciasNoMes(
          dados,
          dia.getFullYear(),
          dia.getMonth(),
        ).some((ocorrencia) => toIsoDate(ocorrencia) === esc.data);

        if (!aindaAcontece) return excluirEscala(esc.id);

        return atualizarDadosEscala(esc.id, {
          eventoNome: dados.nome,
          eventoLocal: dados.local,
          dataHoraServico: montarDataHoraServico(esc.data, dados),
        });
      }),
    );
  }

  // Escala os brigadistas no evento para o dia informado (agendamento manual do admin).
  async function adicionarEscalas(eventoId, dataIso, brigadistaIds) {
    const evento = buscarEvento(eventoId);
    if (!evento) return [];

    const dataHoraServico = montarDataHoraServico(dataIso, evento);
    const competenciaId = dataIso.slice(0, 7);

    const criadas = await Promise.all(
      brigadistaIds.map((brigadistaId) => {
        const brigadista = buscarBrigadista(brigadistaId);
        return adicionarEscala({
          competenciaId,
          eventoId: evento.id,
          brigadistaId,
          eventoNome: evento.nome,
          eventoLocal: evento.local,
          brigadistaNome: brigadista?.nome || "Brigadista",
          dataHoraServico,
          status: "confirmado",
          origem: "manual_admin",
          notificacao: {
            enviarPush: Boolean(evento.notificacoesAtivas),
            enviada: false,
          },
          historicoAlteracao: {
            dataAnterior: null,
            alteradoPorAdminId: admin.id ?? null,
          },
        });
      }),
    );

    return criadas;
  }

  // Tira o brigadista da escala do evento (apaga o documento da coleção "escalas").
  async function removerEscala(escalaId) {
    await excluirEscala(escalaId);
  }

  // Aprova ou recusa uma ou mais solicitações de disponibilidade de uma vez no Firestore.
  async function responderSolicitacoes(ids, status, motivo = null) {
    await responderSolicitacoesNoBanco(ids, status, motivo);

    const pedidosAlvo = solicitacoes.filter((p) => ids.includes(p.id));
    const statusEscala = status === "aprovada" ? "confirmado" : "recusado";

    for (const pedido of pedidosAlvo) {
      // 1. Atualiza escalas pendentes que já existiam para este brigadista nas datas do pedido
      const escalasPendentes = escalas.filter(
        (esc) =>
          esc.brigadistaId === pedido.brigadistaId &&
          esc.status === "pendente" &&
          (pedido.eventoId
            ? esc.eventoId === pedido.eventoId &&
              pedido.datas.includes(esc.data)
            : pedido.datas.includes(esc.data)),
      );

      await Promise.all(
        escalasPendentes.map((esc) =>
          atualizarStatusEscala(esc.id, statusEscala, admin.id ?? null),
        ),
      );

      // 2. Se foi aprovada, garante que haja uma escala confirmada para o evento (ou eventos do dia)
      if (status === "aprovada") {
        for (const dataIso of pedido.datas) {
          const dataObj = parseIsoDate(dataIso);
          const eventosDoDia = pedido.eventoId
            ? [
                buscarEvento(pedido.eventoId) || {
                  id: pedido.eventoId,
                  nome: pedido.eventoNome || "Evento da Brigada",
                  local: pedido.eventoLocal || "Local a definir",
                  dataInicio: dataObj,
                  notificacoesAtivas: true,
                },
              ]
            : eventos.filter((ev) =>
                ocorrenciasNoMes(
                  ev,
                  dataObj.getFullYear(),
                  dataObj.getMonth(),
                ).some((oc) => toIsoDate(oc) === dataIso),
              );

          for (const ev of eventosDoDia) {
            const jaExiste = escalas.some(
              (esc) =>
                esc.brigadistaId === pedido.brigadistaId &&
                esc.eventoId === ev.id &&
                esc.data === dataIso,
            );
            if (!jaExiste) {
              const brigadista = buscarBrigadista(pedido.brigadistaId);
              await adicionarEscala({
                competenciaId: pedido.competenciaId || dataIso.slice(0, 7),
                eventoId: ev.id,
                brigadistaId: pedido.brigadistaId,
                eventoNome: ev.nome,
                eventoLocal: ev.local,
                brigadistaNome:
                  pedido.brigadistaNome || brigadista?.nome || "Brigadista",
                dataHoraServico: montarDataHoraServico(dataIso, ev),
                status: "confirmado",
                origem: "auto_agendamento",
                notificacao: {
                  enviarPush: Boolean(ev.notificacoesAtivas ?? true),
                  enviada: false,
                },
                historicoAlteracao: {
                  dataAnterior: null,
                  alteradoPorAdminId: admin.id ?? null,
                },
              });
            }
          }
        }
      }
    }
  }

  // Remove o evento do Firestore e as escalas ligadas a ele.
  async function excluirEvento(id) {
    await excluirEventoNoBanco(id);
    const escalasDoEv = escalas.filter((item) => item.eventoId === id);
    await Promise.all(escalasDoEv.map((esc) => excluirEscala(esc.id)));
  }

  return (
    <AdminDadosContext.Provider
      value={{
        admin,
        brigadistas,
        eventos,
        carregandoEventos,
        erroEventos,
        escalas,
        solicitacoes,
        tiposCertificados,
        buscarEvento,
        buscarBrigadista,
        escalasDoEvento,
        escalasDoBrigadista,
        salvarEvento,
        excluirEvento,
        adicionarEscalas,
        removerEscala,
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
