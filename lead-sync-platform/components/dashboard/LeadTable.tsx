"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Rows3, Wifi } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { formatLeadDate, getLeadStatusTone, leadStatusOptions } from "@/lib/utils";
import type { EditableLeadField, Lead, LeadUpdatePayload } from "@/types/lead";

function sortLeadsByDate(leads: Lead[]) {
  return [...leads].sort(
    (currentLead, nextLead) =>
      new Date(nextLead.updated_at).getTime() - new Date(currentLead.updated_at).getTime()
  );
}

function upsertLeadCollection(leads: Lead[], incomingLead: Lead) {
  const existingLeadIndex = leads.findIndex((lead) => lead.id === incomingLead.id);

  if (existingLeadIndex === -1) {
    return sortLeadsByDate([incomingLead, ...leads]);
  }

  const nextLeads = [...leads];
  nextLeads[existingLeadIndex] = incomingLead;

  return sortLeadsByDate(nextLeads);
}

export function LeadTable() {
  const supabase = getSupabaseBrowserClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingCellKey, setSavingCellKey] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  async function loadLeads(showRefreshState = false) {
    if (showRefreshState) {
      setIsRefreshing(true);
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setErrorMessage("Nao foi possivel carregar os leads. Verifique sua sessao no Supabase.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setLeads(data ?? []);
    setErrorMessage("");
    setLastSyncedAt(new Date().toISOString());
    setIsLoading(false);
    setIsRefreshing(false);
  }

  useEffect(() => {
    void loadLeads();

    const channel = supabase
      .channel("lead-control-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          setLastSyncedAt(new Date().toISOString());

          if (payload.eventType === "DELETE") {
            setLeads((currentLeads) =>
              currentLeads.filter((lead) => lead.id !== (payload.old as Lead).id)
            );
            return;
          }

          if (!payload.new) {
            return;
          }

          setLeads((currentLeads) => upsertLeadCollection(currentLeads, payload.new as Lead));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function saveLeadField(leadId: string, field: EditableLeadField, value: string) {
    setSavingCellKey(`${leadId}:${field}`);
    setErrorMessage("");

    const updatePayload = {
      updated_at: new Date().toISOString(),
      [field]: value.trim()
    } as LeadUpdatePayload;

    const { error } = await supabase
      .from("leads")
      .update(updatePayload)
      .eq("id", leadId);

    if (error) {
      setErrorMessage("Nao foi possivel salvar a alteracao. A tabela sera recarregada.");
      await loadLeads();
    }

    setSavingCellKey(null);
  }

  function updateLeadDraft(leadId: string, field: EditableLeadField, value: string) {
    setLeads((currentLeads) =>
      currentLeads.map((lead) => (lead.id === leadId ? { ...lead, [field]: value } : lead))
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-[32px]">
        <CardContent className="flex min-h-[420px] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-300">
            <Spinner size="sm" />
            Carregando tabela de leads...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leads.length) {
    return <EmptyState />;
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Tabela colaborativa</CardTitle>
            <CardDescription>
              Edite qualquer linha inline. Cada mudanca atualiza o Supabase e sincroniza com os
              outros usuarios conectados.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge>
              <Rows3 className="h-3.5 w-3.5 text-accent" />
              {leads.length} leads
            </Badge>
            <Badge tone="success">
              <Wifi className="h-3.5 w-3.5" />
              {lastSyncedAt ? `Ultimo sync ${formatLeadDate(lastSyncedAt)}` : "Realtime ativo"}
            </Badge>
            <Button variant="secondary" onClick={() => void loadLeads(true)} disabled={isRefreshing}>
              {isRefreshing ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observacao</TableHead>
                  <TableHead>Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="min-w-[220px]">
                      <input
                        value={lead.nome}
                        onChange={(event) => updateLeadDraft(lead.id, "nome", event.target.value)}
                        onBlur={(event) => void saveLeadField(lead.id, "nome", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-white outline-none transition focus:border-accent/40 focus:bg-white/[0.04]"
                      />
                    </TableCell>

                    <TableCell className="min-w-[180px]">
                      <input
                        value={lead.telefone}
                        onChange={(event) => updateLeadDraft(lead.id, "telefone", event.target.value)}
                        onBlur={(event) => void saveLeadField(lead.id, "telefone", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-accent/40 focus:bg-white/[0.04]"
                      />
                    </TableCell>

                    <TableCell className="min-w-[180px]">
                      <input
                        value={lead.empresa}
                        onChange={(event) => updateLeadDraft(lead.id, "empresa", event.target.value)}
                        onBlur={(event) => void saveLeadField(lead.id, "empresa", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-accent/40 focus:bg-white/[0.04]"
                      />
                    </TableCell>

                    <TableCell className="min-w-[170px]">
                      <input
                        value={lead.cidade}
                        onChange={(event) => updateLeadDraft(lead.id, "cidade", event.target.value)}
                        onBlur={(event) => void saveLeadField(lead.id, "cidade", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-accent/40 focus:bg-white/[0.04]"
                      />
                    </TableCell>

                    <TableCell className="min-w-[170px]">
                      <div className="flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(event) => {
                            updateLeadDraft(lead.id, "status", event.target.value);
                            void saveLeadField(lead.id, "status", event.target.value);
                          }}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
                        >
                          {[...new Set([...leadStatusOptions, lead.status])].map((statusOption) => (
                            <option key={statusOption} value={statusOption} className="bg-slate-950">
                              {statusOption}
                            </option>
                          ))}
                        </select>
                        <Badge tone={getLeadStatusTone(lead.status)}>{lead.status}</Badge>
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[240px]">
                      <input
                        value={lead.observacao}
                        onChange={(event) => updateLeadDraft(lead.id, "observacao", event.target.value)}
                        onBlur={(event) => void saveLeadField(lead.id, "observacao", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-accent/40 focus:bg-white/[0.04]"
                      />
                    </TableCell>

                    <TableCell className="min-w-[160px]">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        {savingCellKey?.startsWith(lead.id) ? <Spinner size="sm" /> : null}
                        <span>{formatLeadDate(lead.updated_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
