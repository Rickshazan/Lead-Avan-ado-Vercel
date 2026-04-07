"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  empresa: string;
  cidade: string;
  status: string;
  observacao: string;
};

export function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);

  async function loadLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLeads(data);
  }

  useEffect(() => {
    loadLeads();

    const channel = supabase
      .channel("realtime-leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => loadLeads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mt-10 border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-black/50">
          <tr>
            <th className="p-3 text-left">Nome</th>
            <th className="p-3 text-left">Telefone</th>
            <th className="p-3 text-left">Empresa</th>
            <th className="p-3 text-left">Cidade</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-white/5">
              <td className="p-3">{lead.nome}</td>
              <td className="p-3">{lead.telefone}</td>
              <td className="p-3">{lead.empresa}</td>
              <td className="p-3">{lead.cidade}</td>
              <td className="p-3">{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
