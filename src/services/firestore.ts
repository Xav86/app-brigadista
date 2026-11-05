import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  Competencia,
  Escala,
  Evento,
  TipoCertificado,
  Usuario,
  validarCompetencia,
  validarEscala,
  validarEvento,
  validarTipoCertificado,
  validarUsuario,
  VALORES_RECORRENCIA,
} from "../models";
import { db } from "./firebase";

export const COLECOES = {
  USUARIOS: "usuarios",
  TIPOS_CERTIFICADOS: "tipos_certificados",
  EVENTOS: "eventos",
  COMPETENCIAS: "competencias",
  CONFIGURACOES: "configuracoes",
  ESCALAS: "escalas",
} as const;

export type RegistroComId<T> = T & { id: string };

function paraDate(valor: unknown): Date {
  if (valor instanceof Timestamp) {
    return valor.toDate();
  }
  if (valor instanceof Date) {
    return valor;
  }
  if (
    valor &&
    typeof valor === "object" &&
    "seconds" in valor &&
    typeof (valor as { seconds: unknown }).seconds === "number"
  ) {
    return new Date((valor as { seconds: number }).seconds * 1000);
  }
  if (typeof valor === "string" || typeof valor === "number") {
    const parsed = new Date(valor);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export async function buscarUsuarioPorEmail(
  email: string,
): Promise<RegistroComId<Usuario> | null> {
  const emailLimpo = email.trim().toLowerCase();
  const q = query(
    collection(db, COLECOES.USUARIOS),
    where("email", "==", emailLimpo),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const raw = docSnap.data();
  return {
    id: docSnap.id,
    nome: raw.nome ?? "",
    email: raw.email ?? "",
    tipoUsuario: raw.tipoUsuario === "admin" ? "admin" : "user",
    cpf: raw.cpf ?? "",
    dataNascimento: raw.dataNascimento ?? "",
    sexo:
      raw.sexo === "M" || raw.sexo === "F" || raw.sexo === "Outro"
        ? raw.sexo
        : "Outro",
    isProfissional: Boolean(raw.isProfissional),
    especialidade: raw.especialidade ?? "nenhum",
    fcmTokens: Array.isArray(raw.fcmTokens) ? raw.fcmTokens : [],
    certificados: Array.isArray(raw.certificados) ? raw.certificados : [],
    criadoEm: paraDate(raw.criadoEm),
  };
}

export async function adicionarUsuario(
  dados: Usuario,
): Promise<RegistroComId<Usuario>> {
  const validado = validarUsuario(dados);
  const payload = {
    ...validado,
    criadoEm: Timestamp.fromDate(validado.criadoEm),
  };
  const ref = await addDoc(collection(db, COLECOES.USUARIOS), payload);
  return { id: ref.id, ...validado };
}

export async function atualizarUsuarioNoBanco(
  id: string,
  dados: Usuario,
): Promise<RegistroComId<Usuario>> {
  const validado = validarUsuario(dados);
  const payload = {
    ...validado,
    criadoEm: Timestamp.fromDate(validado.criadoEm),
  };
  await updateDoc(doc(db, COLECOES.USUARIOS, id), payload);
  return { id, ...validado };
}

export async function adicionarTipoCertificado(
  dados: TipoCertificado,
): Promise<RegistroComId<TipoCertificado>> {
  const validado = validarTipoCertificado(dados);
  const ref = await addDoc(
    collection(db, COLECOES.TIPOS_CERTIFICADOS),
    validado,
  );
  return { id: ref.id, ...validado };
}

// O Firestore guarda datas como Timestamp, então convertemos antes de salvar.
function eventoParaBanco(evento: Evento) {
  return {
    ...evento,
    dataInicio: Timestamp.fromDate(evento.dataInicio),
    dataFim: Timestamp.fromDate(evento.dataFim),
    terminaEm: evento.terminaEm ? Timestamp.fromDate(evento.terminaEm) : null,
  };
}

export async function adicionarEvento(
  dados: Evento,
): Promise<RegistroComId<Evento>> {
  const validado = validarEvento(dados);
  const ref = await addDoc(
    collection(db, COLECOES.EVENTOS),
    eventoParaBanco(validado),
  );
  return { id: ref.id, ...validado };
}

export async function atualizarEvento(
  id: string,
  dados: Evento,
): Promise<RegistroComId<Evento>> {
  const validado = validarEvento(dados);
  await updateDoc(doc(db, COLECOES.EVENTOS, id), eventoParaBanco(validado));
  return { id, ...validado };
}

export async function excluirEvento(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECOES.EVENTOS, id));
}

export async function adicionarCompetencia(
  dados: Competencia,
): Promise<RegistroComId<Competencia>> {
  const validado = validarCompetencia(dados);
  const payload = {
    ...validado,
    dataLimiteEscolha: Timestamp.fromDate(validado.dataLimiteEscolha),
  };
  const ref = await addDoc(collection(db, COLECOES.COMPETENCIAS), payload);
  return { id: ref.id, ...validado };
}

export async function adicionarEscala(
  dados: Escala,
): Promise<RegistroComId<Escala>> {
  const validado = validarEscala(dados);
  const payload = {
    ...validado,
    dataHoraServico: Timestamp.fromDate(validado.dataHoraServico),
    historicoAlteracao: {
      dataAnterior: validado.historicoAlteracao.dataAnterior
        ? Timestamp.fromDate(validado.historicoAlteracao.dataAnterior)
        : null,
      alteradoPorAdminId: validado.historicoAlteracao.alteradoPorAdminId,
    },
  };
  const ref = await addDoc(collection(db, COLECOES.ESCALAS), payload);
  return { id: ref.id, ...validado };
}

export function escutarUsuarios(
  onUpdate: (usuarios: RegistroComId<Usuario>[]) => void,
  onError?: (erro: Error) => void,
) {
  return onSnapshot(
    collection(db, COLECOES.USUARIOS),
    (snapshot) => {
      const lista: RegistroComId<Usuario>[] = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data();
        return {
          id: docSnap.id,
          nome: raw.nome ?? "",
          email: raw.email ?? "",
          tipoUsuario: raw.tipoUsuario === "admin" ? "admin" : "user",
          cpf: raw.cpf ?? "",
          dataNascimento: raw.dataNascimento ?? "",
          sexo:
            raw.sexo === "M" || raw.sexo === "F" || raw.sexo === "Outro"
              ? raw.sexo
              : "Outro",
          isProfissional: Boolean(raw.isProfissional),
          especialidade: raw.especialidade ?? "nenhum",
          fcmTokens: Array.isArray(raw.fcmTokens) ? raw.fcmTokens : [],
          certificados: Array.isArray(raw.certificados) ? raw.certificados : [],
          criadoEm: paraDate(raw.criadoEm),
        };
      });
      onUpdate(lista);
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

export function escutarTiposCertificados(
  onUpdate: (tipos: RegistroComId<TipoCertificado>[]) => void,
  onError?: (erro: Error) => void,
) {
  return onSnapshot(
    collection(db, COLECOES.TIPOS_CERTIFICADOS),
    (snapshot) => {
      const lista: RegistroComId<TipoCertificado>[] = snapshot.docs.map(
        (docSnap) => {
          const raw = docSnap.data();
          return {
            id: docSnap.id,
            nome: raw.nome ?? "",
            cargaHoraria: Number(raw.cargaHoraria) || 0,
            descricao: raw.descricao ?? "",
            validadeMeses: Number(raw.validadeMeses) || 12,
            ativo: raw.ativo !== false,
          };
        },
      );
      onUpdate(lista);
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

export function escutarEventos(
  onUpdate: (eventos: RegistroComId<Evento>[]) => void,
  onError?: (erro: Error) => void,
) {
  return onSnapshot(
    collection(db, COLECOES.EVENTOS),
    (snapshot) => {
      const lista: RegistroComId<Evento>[] = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data();
        return {
          id: docSnap.id,
          nome: raw.nome ?? "",
          descricao: raw.descricao ?? "",
          local: raw.local ?? "",
          dataInicio: paraDate(raw.dataInicio),
          dataFim: paraDate(raw.dataFim),
          tipo: raw.tipo === "recorrente" ? "recorrente" : "esporadico",
          recorrencia: VALORES_RECORRENCIA.includes(raw.recorrencia)
            ? raw.recorrencia
            : "nenhuma",
          diasSemana: Array.isArray(raw.diasSemana) ? raw.diasSemana : [],
          terminaEm: raw.terminaEm ? paraDate(raw.terminaEm) : null,
          certificacoes: Array.isArray(raw.certificacoes)
            ? raw.certificacoes
            : [],
          notificacoesAtivas: raw.notificacoesAtivas !== false,
        };
      });
      onUpdate(lista);
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

// Cada competência é salva com o próprio mês como id (ex.: "competencias/2026-11"),
// assim o admin pode abrir ou fechar o mesmo mês quantas vezes quiser sem duplicar.
export async function salvarCompetencia(
  dados: Competencia,
): Promise<RegistroComId<Competencia>> {
  const validado = validarCompetencia(dados);
  await setDoc(doc(db, COLECOES.COMPETENCIAS, validado.mesReferencia), {
    ...validado,
    dataLimiteEscolha: Timestamp.fromDate(validado.dataLimiteEscolha),
  });
  return { id: validado.mesReferencia, ...validado };
}

export function escutarCompetencia(
  mesReferencia: string,
  onUpdate: (competencia: RegistroComId<Competencia> | null) => void,
  onError?: (erro: Error) => void,
) {
  return onSnapshot(
    doc(db, COLECOES.COMPETENCIAS, mesReferencia),
    (docSnap) => {
      if (!docSnap.exists()) {
        onUpdate(null);
        return;
      }
      const raw = docSnap.data();
      onUpdate({
        id: docSnap.id,
        mesReferencia: raw.mesReferencia ?? mesReferencia,
        titulo: raw.titulo ?? "",
        agendamentoLiberado: Boolean(raw.agendamentoLiberado),
        dataLimiteEscolha: paraDate(raw.dataLimiteEscolha),
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

// Documento único "configuracoes/agendamento" com o mês que está aberto para os brigadistas.
export async function salvarCompetenciaAtual(mesReferencia: string) {
  await setDoc(
    doc(db, COLECOES.CONFIGURACOES, "agendamento"),
    { competenciaAtual: mesReferencia },
    { merge: true },
  );
}

export function escutarCompetenciaAtual(
  onUpdate: (mesReferencia: string | null) => void,
  onError?: (erro: Error) => void,
) {
  return onSnapshot(
    doc(db, COLECOES.CONFIGURACOES, "agendamento"),
    (docSnap) => {
      onUpdate(
        docSnap.exists() ? (docSnap.data().competenciaAtual ?? null) : null,
      );
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}
