"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

export function UploadExcel() {
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
        cellText: false,
      });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 🔥 converte TUDO, mesmo sem header perfeito
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (rows.length < 2) {
        alert("Planilha vazia ou inválida");
        setLoading(false);
        return;
      }

      const headers = rows[0].map((h: any) =>
        String(h).toLowerCase().trim()
      );

      const dataRows = rows.slice(1);

      const leads = dataRows.map((row) => {
        const get = (names: string[]) => {
          for (let name of names) {
            const index = headers.findIndex((h: string) =>
              h.includes(name)
            );
            if (index !== -1) return row[index] || "";
          }
          return "";
        };

        return {
          nome: get(["nome", "name"]),
          telefone: get(["telefone", "celular", "phone", "whatsapp"]),
          empresa: get(["empresa", "company"]),
          cidade: get(["cidade", "city"]),
          status: "Novo",
          observacao: get(["obs", "observacao"]),
        };
      });

      const filtered = leads.filter(
        (l) => l.nome || l.telefone
      );

      if (!filtered.length) {
        alert("Nenhum dado válido encontrado");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("leads")
        .insert(filtered);

      if (error) {
        console.error(error);
        alert("Erro ao salvar no banco");
        setLoading(false);
        return;
      }

      alert(`${filtered.length} leads importados 🚀`);
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Erro ao ler o Excel");
    }

    setLoading(false);
  }

  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-black/30">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {loading && (
        <p className="mt-4 text-sm text-gray-400">
          Importando...
        </p>
      )}
    </div>
  );
}
