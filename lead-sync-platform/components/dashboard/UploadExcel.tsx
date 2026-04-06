"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { parseSpreadsheetBuffer } from "@/lib/excel";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const acceptedFileTypes = ".xlsx,.csv";

export function UploadExcel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowserClient();

  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"default" | "success" | "danger">("default");

  async function insertLeadsInBatches(leads: ReturnType<typeof parseSpreadsheetBuffer>) {
    const batchSize = 200;

    for (let index = 0; index < leads.length; index += batchSize) {
      const currentBatch = leads.slice(index, index + batchSize);
      const { error } = await supabase.from("leads").insert(currentBatch);

      if (error) {
        throw error;
      }
    }
  }

  async function handleSelectedFile(file: File | null) {
    if (!file) {
      return;
    }

    setFeedbackMessage("");
    setIsUploading(true);

    try {
      const fileBuffer = await file.arrayBuffer();
      const leads = parseSpreadsheetBuffer(fileBuffer);

      if (!leads.length) {
        throw new Error("Nenhum lead valido foi encontrado na planilha enviada.");
      }

      await insertLeadsInBatches(leads);

      setFeedbackTone("success");
      setFeedbackMessage(`${leads.length} leads importados com sucesso a partir de ${file.name}.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel processar o arquivo enviado.";

      setFeedbackTone("danger");
      setFeedbackMessage(message);
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Upload de planilha</CardTitle>
            <CardDescription>
              Importe a primeira aba de arquivos .xlsx ou .csv e transforme cada linha em um lead.
            </CardDescription>
          </div>
          <Badge>
            <FileSpreadsheet className="h-3.5 w-3.5 text-accent" />
            SheetJS + Supabase
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <button
          type="button"
          className={`group relative flex min-h-[280px] w-full flex-col items-center justify-center gap-5 rounded-[28px] border border-dashed px-6 text-center transition ${
            isDraggingFile
              ? "border-accent/70 bg-accent/10"
              : "border-white/10 bg-black/20 hover:border-accent/40 hover:bg-white/[0.04]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingFile(false);
            void handleSelectedFile(event.dataTransfer.files?.[0] ?? null);
          }}
          disabled={isUploading}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-gradient-to-br from-accent/20 to-accent-secondary/20 text-accent transition group-hover:scale-105">
            {isUploading ? <Spinner /> : <UploadCloud className="h-10 w-10" />}
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-white">
              {isUploading ? "Processando arquivo..." : "Arraste sua planilha ou clique para enviar"}
            </p>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-400">
              O importador reconhece colunas comuns como Nome, Telefone, Empresa, Cidade, Status e
              Observacao.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">.xlsx</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">.csv</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Realtime para todos os usuarios
            </span>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          className="hidden"
          onChange={(event) => void handleSelectedFile(event.target.files?.[0] ?? null)}
        />

        {feedbackMessage ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedbackTone === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : feedbackTone === "danger"
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                  : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mapeamento automatico</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            O parser tenta identificar cabecalhos equivalentes como Nome, name, Telefone, celular,
            Empresa, company, Cidade, status e Observacao antes de inserir no banco.
          </p>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Spinner size="sm" />
              Importando leads...
            </>
          ) : (
            "Selecionar arquivo"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
