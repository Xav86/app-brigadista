import { addDays, startOfDay, toIsoDate } from "../../utils/calendar";

// Dados de exemplo enquanto eventos, escalas e solicitações não vêm do Firebase.
// As datas são relativas a hoje para que sempre existam eventos próximos e encerrados.
const hoje = startOfDay(new Date());

function emDias(dias, hora, minuto = 0) {
  const data = addDays(hoje, dias);
  data.setHours(hora, minuto, 0, 0);
  return data;
}

function isoEmDias(dias) {
  return toIsoDate(addDays(hoje, dias));
}

function certificado(tipoCertificadoId, nomeCertificado, diasParaVencer) {
  return {
    tipoCertificadoId,
    nomeCertificado,
    dataValidade: isoEmDias(diasParaVencer),
  };
}

export const ADMIN_EXEMPLO = { nome: "Fernando" };

export const BRIGADISTAS_EXEMPLO = [
  {
    id: "b1",
    nome: "João Silva",
    certificados: [
      certificado("nr-23", "NR-23", 210),
      certificado("primeiros-socorros", "Primeiros Socorros", 95),
    ],
  },
  {
    id: "b2",
    nome: "Maria Santos",
    certificados: [
      certificado("combate-incendio", "Combate a Incêndio", 400),
      certificado("primeiros-socorros", "Primeiros Socorros", 20),
    ],
  },
  {
    id: "b3",
    nome: "Pedro Souza",
    certificados: [certificado("nr-23", "NR-23", 45)],
  },
  {
    id: "b4",
    nome: "Ana Costa",
    certificados: [
      certificado("primeiros-socorros", "Primeiros Socorros", 300),
      certificado("combate-incendio", "Combate a Incêndio", -10),
    ],
  },
  {
    id: "b5",
    nome: "Carlos Almeida",
    certificados: [
      certificado("nr-23", "NR-23", 120),
      certificado("primeiros-socorros", "Primeiros Socorros", 120),
      certificado("combate-incendio", "Combate a Incêndio", 500),
    ],
  },
  {
    id: "b6",
    nome: "Beatriz Lima",
    certificados: [
      certificado("primeiros-socorros", "Primeiros Socorros", 250),
    ],
  },
  {
    id: "b7",
    nome: "Rafael Oliveira",
    certificados: [
      certificado("nr-23", "NR-23", 15),
      certificado("combate-incendio", "Combate a Incêndio", 180),
    ],
  },
  {
    id: "b8",
    nome: "Juliana Martins",
    certificados: [],
  },
];

export const EVENTOS_EXEMPLO = [
  {
    id: "e1",
    nome: "Treinamento da Brigada",
    descricao:
      "Treinamento prático de combate a incêndio e primeiros socorros.",
    local: "Unidade Criciúma",
    dataInicio: emDias(3, 9),
    dataFim: emDias(3, 12),
    tipo: "esporadico",
    recorrencia: "nenhuma",
    diasSemana: [],
    terminaEm: null,
    certificacoes: ["nr-23", "primeiros-socorros"],
    notificacoesAtivas: true,
  },
  {
    id: "e2",
    nome: "Festival de Primavera",
    descricao: "Apoio à segurança do público durante o festival da igreja.",
    local: "Parque das Nações",
    dataInicio: emDias(9, 18),
    dataFim: emDias(9, 23),
    tipo: "esporadico",
    recorrencia: "nenhuma",
    diasSemana: [],
    terminaEm: null,
    certificacoes: ["primeiros-socorros"],
    notificacoesAtivas: true,
  },
  {
    id: "e3",
    nome: "Simulado de Emergência",
    descricao: "Simulado de evacuação com toda a equipe.",
    local: "Centro de Treinamento",
    dataInicio: emDias(14, 8),
    dataFim: emDias(14, 12),
    tipo: "esporadico",
    recorrencia: "nenhuma",
    diasSemana: [],
    terminaEm: null,
    certificacoes: ["combate-incendio"],
    notificacoesAtivas: true,
  },
  {
    id: "e4",
    nome: "Reunião Mensal",
    descricao: "Alinhamento mensal da equipe de brigadistas.",
    local: "Unidade Criciúma",
    dataInicio: emDias(-20, 14),
    dataFim: emDias(-20, 15, 30),
    tipo: "recorrente",
    recorrencia: "mensal",
    diasSemana: [],
    terminaEm: null,
    certificacoes: [],
    notificacoesAtivas: true,
  },
  {
    id: "e5",
    nome: "Culto de Domingo",
    descricao: "Escala fixa da brigada durante o culto.",
    local: "Templo Sede",
    dataInicio: emDias(-30, 18),
    dataFim: emDias(-30, 21),
    tipo: "recorrente",
    recorrencia: "semanal",
    diasSemana: [0],
    terminaEm: null,
    certificacoes: ["primeiros-socorros"],
    notificacoesAtivas: false,
  },
  {
    id: "e6",
    nome: "Treinamento Prático",
    descricao: "Uso de extintores e mangueiras.",
    local: "Unidade Criciúma",
    dataInicio: emDias(-24, 9),
    dataFim: emDias(-24, 12),
    tipo: "esporadico",
    recorrencia: "nenhuma",
    diasSemana: [],
    terminaEm: null,
    certificacoes: ["nr-23", "combate-incendio"],
    notificacoesAtivas: true,
  },
];

function escala(id, eventoId, brigadistaId, dias) {
  return {
    id,
    eventoId,
    brigadistaId,
    data: isoEmDias(dias),
    status: "confirmado",
    origem: "manual_admin",
  };
}

export const ESCALAS_EXEMPLO = [
  escala("s1", "e1", "b1", 3),
  escala("s2", "e1", "b2", 3),
  escala("s3", "e1", "b5", 3),
  escala("s4", "e1", "b6", 3),
  escala("s5", "e3", "b4", 14),
  escala("s6", "e3", "b5", 14),
  escala("s7", "e3", "b7", 14),
  escala("s8", "e6", "b1", -24),
  escala("s9", "e6", "b3", -24),
];

function solicitacao(
  id,
  brigadistaId,
  diasDasDatas,
  enviadaHaDias,
  status = "pendente",
  motivo = null,
) {
  return {
    id,
    brigadistaId,
    datas: diasDasDatas.map(isoEmDias),
    enviadaEm: emDias(-enviadaHaDias, 10),
    status,
    motivo,
  };
}

export const SOLICITACOES_EXEMPLO = [
  solicitacao("p1", "b1", [9, 14, 21], 1),
  solicitacao("p2", "b3", [9], 1),
  solicitacao("p3", "b6", [14, 28], 2),
  solicitacao("p4", "b8", [9, 10], 3),
  solicitacao("p5", "b7", [3, 9, 17], 4),
  solicitacao("p6", "b2", [14], 6, "aprovada"),
  solicitacao(
    "p7",
    "b4",
    [3],
    8,
    "recusada",
    "Equipe do evento já está completa.",
  ),
];
