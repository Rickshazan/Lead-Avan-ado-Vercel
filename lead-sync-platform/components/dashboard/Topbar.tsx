"use client";

import { useRouter } from "next/navigation";
import { DoorOpen, PencilLine, ShieldCheck, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearWorkspaceIdentity, clearWorkspaceSession } from "@/lib/auth";

type TopbarProps = {
  displayName: string;
};

export function Topbar({ displayName }: TopbarProps) {
  const router = useRouter();

  function handleRename() {
    clearWorkspaceIdentity();
    router.replace("/login");
  }

  function handleLogout() {
    clearWorkspaceSession();
    router.replace("/login");
  }

  return (
    <Card className="rounded-[32px]">
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Link privado ativo
            </Badge>
            <Badge tone="success">
              <Wifi className="h-3.5 w-3.5" />
              Sync em tempo real ativo
            </Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">Lead Control Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Importe planilhas, edite leads inline e acompanhe todas as atualizacoes da equipe.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-[28px] border border-white/10 bg-black/20 px-5 py-4 sm:min-w-[280px]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Colaborador atual</p>
            <p className="mt-2 text-sm font-medium text-white">{displayName}</p>
          </div>

          <div className="flex w-full flex-wrap gap-3">
            <Button variant="secondary" onClick={handleRename} className="flex-1">
              <PencilLine className="h-4 w-4" />
              Trocar nome
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="flex-1">
              <DoorOpen className="h-4 w-4" />
              Sair do link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
