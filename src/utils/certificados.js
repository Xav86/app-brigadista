import { parseIsoDate, startOfDay } from "./calendar";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Dias até a validade (negativo = já vencido).
export function diasParaVencer(dataValidadeIso, hoje = new Date()) {
  const validade = parseIsoDate(dataValidadeIso);
  return Math.round((validade - startOfDay(hoje)) / MS_POR_DIA);
}

export function certificadoVencido(certificado, hoje = new Date()) {
  return diasParaVencer(certificado.dataValidade, hoje) < 0;
}

// Certificados ainda válidos que vencem dentro do prazo informado.
export function contarCertificadosVencendo(
  brigadistas,
  prazoEmDias = 60,
  hoje = new Date(),
) {
  return brigadistas.reduce((total, brigadista) => {
    const vencendo = (brigadista.certificados ?? []).filter((certificado) => {
      const dias = diasParaVencer(certificado.dataValidade, hoje);
      return dias >= 0 && dias <= prazoEmDias;
    });
    return total + vencendo.length;
  }, 0);
}
