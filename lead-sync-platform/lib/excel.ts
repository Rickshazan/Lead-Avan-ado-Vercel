import * as XLSX from "xlsx";
import { mapColumn } from "./normalize";

export type ParsedLead = {
  nome?: string;
  telefone?: string;
  empresa?: string;
  cidade?: string;
  status?: string;
  observacao?: string;
};

export async function parseExcel(file: File): Promise<ParsedLead[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet);

  const leads: ParsedLead[] = [];

  for (const row of json) {
    const parsed: ParsedLead = {};

    for (const key in row) {
      const mapped = mapColumn(key);

      if (mapped) {
        parsed[mapped as keyof ParsedLead] = String(row[key]).trim();
      }
    }

    // Só aceita se tiver pelo menos nome OU telefone
    if (parsed.nome || parsed.telefone) {
      leads.push(parsed);
    }
  }

  return leads;
}
