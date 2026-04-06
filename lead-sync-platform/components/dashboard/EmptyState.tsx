import { DatabaseZap, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="relative overflow-hidden rounded-[28px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 animate-float items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/20 to-accent-secondary/20 text-accent">
          <DatabaseZap className="h-10 w-10" />
        </div>
        <div className="max-w-lg space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Espaco pronto para receber leads
          </div>
          <h3 className="text-3xl font-semibold text-white">Nenhum lead importado ainda</h3>
          <p className="text-sm leading-7 text-slate-400 sm:text-base">
            Envie sua primeira planilha para preencher a tabela colaborativa. Novos registros vao
            surgir aqui em tempo real para toda a equipe conectada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
