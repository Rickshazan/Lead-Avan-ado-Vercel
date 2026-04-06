"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  getBrowserDisplayName,
  hasBrowserWorkspaceAccess,
  persistWorkspaceIdentity
} from "@/lib/auth";

function getAccessMessage(errorCode: string | null) {
  if (errorCode === "invalid-link") {
    return "Esse link privado nao e valido ou expirou. Abra o link correto para liberar o workspace.";
  }

  return "Abra seu link privado para liberar o acesso. Depois basta informar um nome para entrar.";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [displayName, setDisplayName] = useState("");
  const [hasWorkspaceAccess, setHasWorkspaceAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const accessMessage = useMemo(
    () => getAccessMessage(searchParams.get("error")),
    [searchParams]
  );

  useEffect(() => {
    const accessGranted = hasBrowserWorkspaceAccess();
    const savedDisplayName = getBrowserDisplayName();

    setHasWorkspaceAccess(accessGranted);
    setDisplayName(savedDisplayName);

    if (accessGranted && savedDisplayName) {
      router.replace("/dashboard");
      return;
    }

    setIsCheckingAccess(false);
  }, [router]);

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasWorkspaceAccess) {
      setErrorMessage("Abra o link privado antes de escolher um nome.");
      return;
    }

    const normalizedDisplayName = displayName.trim();

    if (!normalizedDisplayName) {
      setErrorMessage("Informe um nome para entrar no workspace.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    persistWorkspaceIdentity(normalizedDisplayName);
    router.replace("/dashboard");
  }

  if (isCheckingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel flex items-center gap-3 rounded-3xl px-6 py-4 text-sm text-muted">
          <Spinner size="sm" />
          Preparando acesso ao workspace...
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
                  Workspace privado por link com entrada instantanea por nome.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  Compartilhe um unico link com quem deve acessar a operacao. Depois disso, cada
                  pessoa informa apenas o proprio nome para entrar no painel colaborativo.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Link privado</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  O acesso e liberado apenas por uma rota secreta compartilhada manualmente.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Sem senha</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  O usuario nao precisa de email, senha ou confirmacao no Supabase Auth.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Identificacao rapida</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Cada pessoa escolhe um nome local para trabalhar no mesmo workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-2xl">
              {hasWorkspaceAccess ? "Escolha seu nome" : "Acesso protegido por link"}
            </CardTitle>
            <CardDescription>
              {hasWorkspaceAccess
                ? "Digite o nome que deseja exibir neste workspace compartilhado."
                : "Esse ambiente so pode ser liberado por um link privado com token."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{accessMessage}</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleContinue}>
              <div className="space-y-2">
                <label className="text-sm text-slate-300" htmlFor="display-name">
                  Nome de exibicao
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Ex.: Ricardo, Ana, Comercial"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="pl-11"
                    maxLength={60}
                    disabled={!hasWorkspaceAccess || isSubmitting}
                    required
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!hasWorkspaceAccess || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no dashboard
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
