"use client";

import { Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Topbar() {
  return (
    <Card className="rounded-[32px]">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Lead Control
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Painel de Leads
          </h1>
        </div>

        <Badge>
          <Wifi className="h-3.5 w-3.5" />
          Tempo real ativo
        </Badge>
      </CardContent>
    </Card>
  );
}
