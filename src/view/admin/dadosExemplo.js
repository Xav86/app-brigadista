import { addDays, startOfDay, toIsoDate } from "../../utils/calendar";

// Dados de exemplo enquanto brigadistas do painel e solicitações não vêm do Firebase.
// As datas são relativas a hoje para que as solicitações sempre caiam no mês aberto.
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
