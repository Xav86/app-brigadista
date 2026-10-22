import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
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
} from "../models";
import { db } from "./firebase";

export const COLECOES = {
  USUARIOS: "usuarios",
  TIPOS_CERTIFICADOS: "tipos_certificados",
  EVENTOS: "eventos",
  COMPETENCIAS: "competencias",
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

export async function adicionarEvento(
  dados: Evento,
): Promise<RegistroComId<Evento>> {
  const validado = validarEvento(dados);
  const payload = {
    ...validado,
    dataInicio: Timestamp.fromDate(validado.dataInicio),
    dataFim: Timestamp.fromDate(validado.dataFim),
  };
  const ref = await addDoc(collection(db, COLECOES.EVENTOS), payload);
  return { id: ref.id, ...validado };
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
