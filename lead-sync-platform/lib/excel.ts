import * as XLSX from "xlsx";

import type { LeadInsertPayload } from "@/types/lead";

const columnAliases = {
  nome: ["nome", "name", "lead", "contato"],
  telefone: ["telefone", "phone", "celular", "whatsapp"],
  empresa: ["empresa", "company", "negocio", "organizacao"],
  cidade: ["cidade", "city", "municipio"],
  status: ["status", "etapa", "fase"],
  observacao: ["observacao", "observacoes", "obs", "notas", "notes"]
};

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getNormalizedCellValue(row: Record<string, unknown>, aliases: string[]) {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.includes(normalizeHeader(key))) {
      return String(value ?? "").trim();
    }
  }

  return "";
}

export function parseSpreadsheetBuffer(fileBuffer: ArrayBuffer): LeadInsertPayload[] {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: ""
  });

  const leads: LeadInsertPayload[] = [];

  rawRows.forEach((row, index) => {
    const nome = getNormalizedCellValue(row, columnAliases.nome);
    const telefone = getNormalizedCellValue(row, columnAliases.telefone);
    const empresa = getNormalizedCellValue(row, columnAliases.empresa);
    const cidade = getNormalizedCellValue(row, columnAliases.cidade);
    const status = getNormalizedCellValue(row, columnAliases.status) || "Novo";
    const observacao = getNormalizedCellValue(row, columnAliases.observacao);

    const hasMeaningfulContent = [nome, telefone, empresa, cidade, observacao].some(
      (value) => value.length > 0
    );

    if (!hasMeaningfulContent) {
      return;
    }

    leads.push({
      nome: nome || `Lead ${index + 1}`,
      telefone,
      empresa,
      cidade,
      status,
      observacao
    });
  });

  return leads;
}
