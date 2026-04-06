"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { persistAuthSession } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      persistAuthSession(session);

      if (session) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingSession(false);
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      persistAuthSession(session);

      if (session) {
        router.replace("/dashboard");
      }
    });

    void initializeSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMessage("Nao foi possivel entrar. Confira suas credenciais.");
      setIsLoading(false);
      return;
    }

    persistAuthSession(data.session ?? null);
    router.replace("/dashboard");
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel flex items-center gap-3 rounded-3xl px-6 py-4 text-sm text-muted">
          <Spinner size="sm" />
          Validando sessao...
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell flex min-h-screen items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel relative overflow-hidden rounded-[32px] p-8 sm:p-10">
          <div className="glass-highlight absolute inset-0" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Lead Control
              </div>
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Operacao de leads colaborativa com visual premium e sync em tempo real.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  Importe planilhas, organize seu pipeline e acompanhe mudancas da equipe no mesmo
                  instante em uma interface limpa, escura e sofisticada.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Excel para banco</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Leitura de arquivos .xlsx e .csv com mapeamento automatico.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Tabela editavel</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Campos alterados inline com atualizacao imediata no Supabase.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Realtime nativo</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Cada importacao ou edicao aparece para todos os usuarios conectados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-2xl">Entrar na plataforma</CardTitle>
            <CardDescription>
              Use email e senha do Supabase Auth para acessar o workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm text-slate-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Acessar dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
