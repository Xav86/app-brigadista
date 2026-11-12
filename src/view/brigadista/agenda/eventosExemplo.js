// Dados de exemplo enquanto não há backend/armazenamento local para a agenda da brigadista.
export const EVENTOS_EXEMPLO = [
  {
    id: "1",
    data: new Date(2026, 9, 5),
    titulo: "Treinamento da Brigada",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "confirmado",
  },
  {
    id: "2",
    data: new Date(2026, 9, 12),
    titulo: "Treinamento prático",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "pendente",
  },
  {
    id: "3",
    data: new Date(2026, 9, 26),
    titulo: "Simulado de Emergência",
    horario: "09:00 - 12:00",
    local: "Unidade Criciúma",
    status: "confirmado",
  },
];

export const STATUS_EVENTO_EXEMPLO = {
  confirmado: { label: "Confirmada", tone: "success" },
  pendente: { label: "Aguardando", tone: "warning" },
};
