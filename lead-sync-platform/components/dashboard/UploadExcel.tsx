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
      const workbook = XLSX.read(buffer, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!json.length) {
        alert("Planilha vazia.");
        setLoading(false);
        return;
      }

      // 🔥 mapeamento simples (aceita qualquer coisa)
      const leads = json.map((row) => ({
        nome:
          row.nome ||
          row.Nome ||
          row.name ||
          row["Nome Completo"] ||
          "",

        telefone:
          row.telefone ||
          row.Telefone ||
          row.celular ||
          row.whatsapp ||
          "",

        empresa:
          row.empresa ||
          row.Empresa ||
          row.company ||
          "",

        cidade:
          row.cidade ||
          row.Cidade ||
          "",

        status:
          row.status ||
          "Novo",

        observacao:
          row.observacao ||
          row.obs ||
          "",
      }));

      // remove completamente vazios
      const filtered = leads.filter(
        (l) => l.nome || l.telefone
      );

      if (!filtered.length) {
        alert("Nenhum lead válido encontrado.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("leads")
        .insert(filtered);

      if (error) {
        console.error(error);
        alert("Erro ao salvar no banco.");
        setLoading(false);
        return;
      }

      alert(`${filtered.length} leads importados 🚀`);
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Erro ao processar arquivo.");
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
