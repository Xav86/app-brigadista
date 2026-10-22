import { parseIsoDate } from "../../../utils/calendar";
import { certificadoVencido } from "../../../utils/certificados";
import { TIPOS_CERTIFICADOS_PADRAO } from "../gestao/useBrigadistas";

function nomeDoTipo(tipoId) {
  return (
    TIPOS_CERTIFICADOS_PADRAO.find((tipo) => tipo.id === tipoId)?.nome ?? tipoId
  );
}

// Monta a lista de brigadistas para o agendamento manual de um evento em um dia:
// quem pediu esse dia aparece primeiro, quem já está escalado vai para o fim (e não pode
// ser marcado de novo) e cada um traz as certificações exigidas que estão faltando ou vencidas.
export function montarCandidatos({
  brigadistas,
  escalas,
  solicitacoes,
  evento,
  dataIso,
}) {
  const dia = parseIsoDate(dataIso);
  const exigidas = evento?.certificacoes ?? [];

  const candidatos = brigadistas.map((brigadista) => {
    const jaEscalado = escalas.some(
      (item) =>
        item.eventoId === evento?.id &&
        item.brigadistaId === brigadista.id &&
        item.data === dataIso,
    );
    const disponivel = solicitacoes.some(
      (pedido) =>
        pedido.brigadistaId === brigadista.id &&
        pedido.status !== "recusada" &&
        pedido.datas.includes(dataIso),
    );

    const pendencias = exigidas
      .map((tipoId) => {
        const certificado = brigadista.certificados.find(
          (item) => item.tipoCertificadoId === tipoId,
        );
        if (!certificado) return `${nomeDoTipo(tipoId)} (não possui)`;
        if (certificadoVencido(certificado, dia)) {
          return `${nomeDoTipo(tipoId)} (vencida)`;
        }
        return null;
      })
      .filter(Boolean);

    return { brigadista, jaEscalado, disponivel, pendencias };
  });

  return candidatos.sort((a, b) => {
    if (a.jaEscalado !== b.jaEscalado) return a.jaEscalado ? 1 : -1;
    if (a.disponivel !== b.disponivel) return a.disponivel ? -1 : 1;
    return a.brigadista.nome.localeCompare(b.brigadista.nome, "pt-BR");
  });
}
