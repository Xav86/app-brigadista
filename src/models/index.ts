export type StatusEscala = "pendente" | "confirmado" | "recusado" | "proposto";
export type OrigemEscala = "auto_agendamento" | "manual_admin";

export interface Escala {
  // Referências aos relacionamentos
  competenciaId: string; // Referência à coleção 'competencias' (Ex: "2026-11")
  eventoId: string; // Referência à coleção 'eventos'
  brigadistaId: string; // Referência à coleção 'usuarios'

  // Dados Desnormalizados (Copiados para acelerar a leitura nas telas)
  eventoNome: string;
  eventoLocal: string;
  brigadistaNome: string;

  dataHoraServico: Date; // Quando o brigadista vai atuar (Timestamp)
  status: StatusEscala;
  origem: OrigemEscala;

  notificacao: {
    enviarPush: boolean; // Req 12 - Admin pode desligar o push daqui
    enviada: boolean; // Controle do backend para não enviar duas vezes
  };

  historicoAlteracao: {
    dataAnterior: Date | null; // Caso o admin proponha nova data (Req 4)
    alteradoPorAdminId: string | null;
  };
}

export interface Competencia {
  mesReferencia: string; // Ex: "2026-11"
  titulo: string; // Ex: "Novembro 2026"
  agendamentoLiberado: boolean;
  dataLimiteEscolha: Date; // Prazo máximo para o brigadista escolher a data
}

export type TipoEvento = "recorrente" | "esporadico";
export type Recorrencia =
  | "diario"
  | "semanal"
  | "mensal"
  | "trimestral"
  | "semestral"
  | "anual"
  | "nenhuma";

export interface Evento {
  nome: string;
  local: string;
  dataInicio: Date; // Timestamp do Firebase
  dataFim: Date; // Timestamp do Firebase
  tipo: TipoEvento;
  recorrencia: Recorrencia;
  notificacoesAtivas: boolean;
}

export interface TipoCertificado {
  nome: string;
  cargaHoraria: number;
  descricao: string;
  validadeMeses: number;
  ativo: boolean; // Para o admin poder desativar sem apagar o histórico
}

export type TipoUsuario = "admin" | "user";
export type Sexo = "M" | "F" | "Outro";
export type StatusEspecialidade =
  | "medico"
  | "bombeiro_militar"
  | "bombeiro_civil"
  | "enfermeiro"
  | "policial"
  | "militar"
  | "nenhum";

// Fica embutido dentro do array 'certificados' do Usuario
export interface CertificadoBrigadista {
  tipoCertificadoId: string; // Referência à coleção 'tipos_certificados'
  nomeCertificado: string; // Dado duplicado para evitar consultas extras
  emissor: string;
  dataEmissao: string; // Formato ISO "YYYY-MM-DD"
  dataValidade: string; // Formato ISO "YYYY-MM-DD"
}

export interface Usuario {
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  cpf: string;
  dataNascimento: string; // Formato ISO "YYYY-MM-DD"
  sexo: Sexo;
  isProfissional: boolean;
  especialidade: StatusEspecialidade;
  fcmTokens: string[]; // Tokens para notificação push (Req 11)
  certificados: CertificadoBrigadista[]; // Sub-documentos embutidos
  criadoEm: Date; // Timestamp do Firebase
}

export const VALORES_STATUS_ESCALA: StatusEscala[] = [
  "pendente",
  "confirmado",
  "recusado",
  "proposto",
];

export const VALORES_ORIGEM_ESCALA: OrigemEscala[] = [
  "auto_agendamento",
  "manual_admin",
];

export const VALORES_TIPO_EVENTO: TipoEvento[] = ["recorrente", "esporadico"];

export const VALORES_RECORRENCIA: Recorrencia[] = [
  "diario",
  "semanal",
  "mensal",
  "trimestral",
  "semestral",
  "anual",
  "nenhuma",
];

export const VALORES_TIPO_USUARIO: TipoUsuario[] = ["admin", "user"];

export const VALORES_SEXO: Sexo[] = ["M", "F", "Outro"];

export const VALORES_ESPECIALIDADE: StatusEspecialidade[] = [
  "medico",
  "bombeiro_militar",
  "bombeiro_civil",
  "enfermeiro",
  "policial",
  "militar",
  "nenhum",
];

const REGEX_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_MES_REF = /^\d{4}-\d{2}$/;

function assertTextoNaoVazio(valor: unknown, campo: string): asserts valor is string {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new Error(`O campo obrigatório "${campo}" deve ser um texto não vazio.`);
  }
}

function assertBooleano(valor: unknown, campo: string): asserts valor is boolean {
  if (typeof valor !== "boolean") {
    throw new Error(`O campo "${campo}" deve ser booleano (true/false).`);
  }
}

function assertNumeroPositivo(valor: unknown, campo: string): asserts valor is number {
  if (typeof valor !== "number" || Number.isNaN(valor) || valor <= 0) {
    throw new Error(`O campo "${campo}" deve ser um número maior que zero.`);
  }
}

function assertDataValida(valor: unknown, campo: string): asserts valor is Date {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new Error(`O campo "${campo}" deve ser uma instância válida de Date.`);
  }
}

function assertIsoDateString(valor: unknown, campo: string): asserts valor is string {
  assertTextoNaoVazio(valor, campo);
  if (!REGEX_ISO_DATE.test(valor)) {
    throw new Error(
      `O campo "${campo}" deve estar no formato ISO "YYYY-MM-DD" (recebido: "${valor}").`,
    );
  }
}

function assertEnum<T extends string>(
  valor: unknown,
  permitidos: readonly T[],
  campo: string,
): asserts valor is T {
  if (typeof valor !== "string" || !permitidos.includes(valor as T)) {
    throw new Error(
      `O campo "${campo}" deve ser um dos valores: ${permitidos.join(", ")}.`,
    );
  }
}

export function validarCertificadoBrigadista(
  cert: unknown,
  indice = 0,
): CertificadoBrigadista {
  if (!cert || typeof cert !== "object") {
    throw new Error(`Certificado na posição ${indice} é inválido.`);
  }
  const c = cert as Record<string, unknown>;
  assertTextoNaoVazio(c.tipoCertificadoId, `certificados[${indice}].tipoCertificadoId`);
  assertTextoNaoVazio(c.nomeCertificado, `certificados[${indice}].nomeCertificado`);
  assertTextoNaoVazio(c.emissor, `certificados[${indice}].emissor`);
  assertIsoDateString(c.dataEmissao, `certificados[${indice}].dataEmissao`);
  assertIsoDateString(c.dataValidade, `certificados[${indice}].dataValidade`);

  return {
    tipoCertificadoId: c.tipoCertificadoId.trim(),
    nomeCertificado: c.nomeCertificado.trim(),
    emissor: c.emissor.trim(),
    dataEmissao: c.dataEmissao,
    dataValidade: c.dataValidade,
  };
}

export function validarUsuario(dados: unknown): Usuario {
  if (!dados || typeof dados !== "object") {
    throw new Error("Os dados do usuário são obrigatórios.");
  }
  const u = dados as Record<string, unknown>;

  assertTextoNaoVazio(u.nome, "nome");
  assertTextoNaoVazio(u.email, "email");
  assertEnum(u.tipoUsuario, VALORES_TIPO_USUARIO, "tipoUsuario");
  assertTextoNaoVazio(u.cpf, "cpf");
  assertIsoDateString(u.dataNascimento, "dataNascimento");
  assertEnum(u.sexo, VALORES_SEXO, "sexo");
  assertBooleano(u.isProfissional, "isProfissional");
  assertEnum(u.especialidade, VALORES_ESPECIALIDADE, "especialidade");

  if (!Array.isArray(u.fcmTokens) || !u.fcmTokens.every((t) => typeof t === "string")) {
    throw new Error('O campo "fcmTokens" deve ser uma lista de strings.');
  }

  if (!Array.isArray(u.certificados)) {
    throw new Error('O campo "certificados" deve ser uma lista de certificados.');
  }
  const certificados = u.certificados.map((cert, i) =>
    validarCertificadoBrigadista(cert, i),
  );

  assertDataValida(u.criadoEm, "criadoEm");

  return {
    nome: u.nome.trim(),
    email: u.email.trim(),
    tipoUsuario: u.tipoUsuario,
    cpf: u.cpf.trim(),
    dataNascimento: u.dataNascimento,
    sexo: u.sexo,
    isProfissional: u.isProfissional,
    especialidade: u.especialidade,
    fcmTokens: u.fcmTokens,
    certificados,
    criadoEm: u.criadoEm,
  };
}

export function validarTipoCertificado(dados: unknown): TipoCertificado {
  if (!dados || typeof dados !== "object") {
    throw new Error("Os dados do tipo de certificado são obrigatórios.");
  }
  const tc = dados as Record<string, unknown>;

  assertTextoNaoVazio(tc.nome, "nome");
  assertNumeroPositivo(tc.cargaHoraria, "cargaHoraria");
  assertTextoNaoVazio(tc.descricao, "descricao");
  assertNumeroPositivo(tc.validadeMeses, "validadeMeses");
  assertBooleano(tc.ativo, "ativo");

  return {
    nome: tc.nome.trim(),
    cargaHoraria: tc.cargaHoraria,
    descricao: tc.descricao.trim(),
    validadeMeses: tc.validadeMeses,
    ativo: tc.ativo,
  };
}

export function validarEvento(dados: unknown): Evento {
  if (!dados || typeof dados !== "object") {
    throw new Error("Os dados do evento são obrigatórios.");
  }
  const ev = dados as Record<string, unknown>;

  assertTextoNaoVazio(ev.nome, "nome");
  assertTextoNaoVazio(ev.local, "local");
  assertDataValida(ev.dataInicio, "dataInicio");
  assertDataValida(ev.dataFim, "dataFim");
  assertEnum(ev.tipo, VALORES_TIPO_EVENTO, "tipo");
  assertEnum(ev.recorrencia, VALORES_RECORRENCIA, "recorrencia");
  assertBooleano(ev.notificacoesAtivas, "notificacoesAtivas");

  return {
    nome: ev.nome.trim(),
    local: ev.local.trim(),
    dataInicio: ev.dataInicio,
    dataFim: ev.dataFim,
    tipo: ev.tipo,
    recorrencia: ev.recorrencia,
    notificacoesAtivas: ev.notificacoesAtivas,
  };
}

export function validarCompetencia(dados: unknown): Competencia {
  if (!dados || typeof dados !== "object") {
    throw new Error("Os dados da competência são obrigatórios.");
  }
  const comp = dados as Record<string, unknown>;

  assertTextoNaoVazio(comp.mesReferencia, "mesReferencia");
  if (!REGEX_MES_REF.test(comp.mesReferencia)) {
    throw new Error('O campo "mesReferencia" deve estar no formato "YYYY-MM".');
  }
  assertTextoNaoVazio(comp.titulo, "titulo");
  assertBooleano(comp.agendamentoLiberado, "agendamentoLiberado");
  assertDataValida(comp.dataLimiteEscolha, "dataLimiteEscolha");

  return {
    mesReferencia: comp.mesReferencia,
    titulo: comp.titulo.trim(),
    agendamentoLiberado: comp.agendamentoLiberado,
    dataLimiteEscolha: comp.dataLimiteEscolha,
  };
}

export function validarEscala(dados: unknown): Escala {
  if (!dados || typeof dados !== "object") {
    throw new Error("Os dados da escala são obrigatórios.");
  }
  const esc = dados as Record<string, unknown>;

  assertTextoNaoVazio(esc.competenciaId, "competenciaId");
  assertTextoNaoVazio(esc.eventoId, "eventoId");
  assertTextoNaoVazio(esc.brigadistaId, "brigadistaId");
  assertTextoNaoVazio(esc.eventoNome, "eventoNome");
  assertTextoNaoVazio(esc.eventoLocal, "eventoLocal");
  assertTextoNaoVazio(esc.brigadistaNome, "brigadistaNome");
  assertDataValida(esc.dataHoraServico, "dataHoraServico");
  assertEnum(esc.status, VALORES_STATUS_ESCALA, "status");
  assertEnum(esc.origem, VALORES_ORIGEM_ESCALA, "origem");

  if (!esc.notificacao || typeof esc.notificacao !== "object") {
    throw new Error('O objeto "notificacao" é obrigatório.');
  }
  const notif = esc.notificacao as Record<string, unknown>;
  assertBooleano(notif.enviarPush, "notificacao.enviarPush");
  assertBooleano(notif.enviada, "notificacao.enviada");

  if (!esc.historicoAlteracao || typeof esc.historicoAlteracao !== "object") {
    throw new Error('O objeto "historicoAlteracao" é obrigatório.');
  }
  const hist = esc.historicoAlteracao as Record<string, unknown>;
  if (hist.dataAnterior !== null) {
    assertDataValida(hist.dataAnterior, "historicoAlteracao.dataAnterior");
  }
  if (
    hist.alteradoPorAdminId !== null &&
    typeof hist.alteradoPorAdminId !== "string"
  ) {
    throw new Error(
      'O campo "historicoAlteracao.alteradoPorAdminId" deve ser string ou null.',
    );
  }

  return {
    competenciaId: esc.competenciaId.trim(),
    eventoId: esc.eventoId.trim(),
    brigadistaId: esc.brigadistaId.trim(),
    eventoNome: esc.eventoNome.trim(),
    eventoLocal: esc.eventoLocal.trim(),
    brigadistaNome: esc.brigadistaNome.trim(),
    dataHoraServico: esc.dataHoraServico,
    status: esc.status,
    origem: esc.origem,
    notificacao: {
      enviarPush: notif.enviarPush,
      enviada: notif.enviada,
    },
    historicoAlteracao: {
      dataAnterior: hist.dataAnterior as Date | null,
      alteradoPorAdminId: hist.alteradoPorAdminId as string | null,
    },
  };
}
