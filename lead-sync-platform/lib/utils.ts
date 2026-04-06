import type { EditableLeadField } from "@/types/lead";

export const editableLeadFields: EditableLeadField[] = [
  "nome",
  "telefone",
  "empresa",
  "cidade",
  "status",
  "observacao"
];

export const leadStatusOptions = [
  "Novo",
  "Em contato",
  "Qualificado",
  "Proposta",
  "Convertido",
  "Perdido"
];

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatLeadDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));
}

export function getLeadStatusTone(
  status: string
): "default" | "success" | "warning" | "danger" {
  const normalizedStatus = status.trim().toLowerCase();

  if (["convertido", "ganho", "fechado"].includes(normalizedStatus)) {
    return "success";
  }

  if (["proposta", "qualificado", "em contato"].includes(normalizedStatus)) {
    return "warning";
  }

  if (["perdido", "inativo"].includes(normalizedStatus)) {
    return "danger";
  }

  return "default";
}
