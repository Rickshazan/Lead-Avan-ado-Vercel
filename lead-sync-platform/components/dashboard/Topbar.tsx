"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearAuthSessionCookies, persistAuthSession } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function Topbar() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("Carregando...");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        clearAuthSessionCookies();
        router.replace("/login");
        return;
      }

      persistAuthSession(session);
      setEmail(session.user.email ?? "usuario@workspace");
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      persistAuthSession(session);

      if (!session) {
        clearAuthSessionCookies();
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? "usuario@workspace");
    });

    void loadSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    clearAuthSessionCookies();
    router.replace("/login");
  }

  return (
    <Card className="rounded-[32px]">
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Ambiente autenticado
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

        <div className="flex flex-col items-start gap-4 rounded-[28px] border border-white/10 bg-black/20 px-5 py-4 sm:min-w-[260px]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessao atual</p>
            <p className="mt-2 text-sm font-medium text-white">{email}</p>
          </div>

          <Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Saindo..." : "Encerrar sessao"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
