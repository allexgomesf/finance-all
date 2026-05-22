"use client";

import { useRef, useTransition } from "react";
import { CloudUploadIcon, DownloadIcon, Trash2Icon, FileIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { uploadAnexoAction, deleteAnexoAction } from "@/lib/actions/projetos";
import type { AnexoSigned } from "@/lib/data/projetos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnexosSection({
  projetoId,
  signedUrls,
}: {
  projetoId: string;
  signedUrls: AnexoSigned[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("projeto_id", projetoId);
    formData.set("arquivo", file);

    startUpload(async () => {
      const result = await uploadAnexoAction({}, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Arquivo anexado com sucesso.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleDelete(path: string, name: string) {
    startDelete(async () => {
      await deleteAnexoAction(projetoId, path);
      toast.success(`"${name}" removido.`);
    });
  }

  const isBusy = isUploading || isDeleting;

  return (
    <Card className="p-6">
      <h2 className="font-heading mb-4 text-sm font-semibold text-foreground">
        Anexar arquivos ao projeto
      </h2>

      {signedUrls.length > 0 ? (
        <ul className="mb-5 space-y-2">
          {signedUrls.map(({ path, url, name }) => (
            <li
              key={path}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{name}</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                title="Baixar"
              >
                <DownloadIcon className="size-4" />
              </a>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleDelete(path, name)}
                className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                title="Remover"
              >
                <Trash2Icon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-5 flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <CloudUploadIcon className="size-12 opacity-40" />
          <p className="text-sm">Nenhum arquivo anexado ainda.</p>
        </div>
      )}

      <div className="flex justify-center">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          disabled={isBusy}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <CloudUploadIcon className="size-4" />
          )}
          {isUploading ? "Enviando…" : "Anexar arquivo"}
        </Button>
      </div>
    </Card>
  );
}
