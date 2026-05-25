"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Field } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { createUsuario, updateUsuario } from "@/lib/actions/usuarios";
import type { ProfileWithEmail } from "@/lib/data/profiles";
import { formatPhone } from "@/lib/format";

type Mode = "create" | "edit" | "view";

const COPY: Record<Mode, { title: string; description: string }> = {
  create: {
    title: "Adicionar usuário",
    description: "Cadastre um novo acesso à plataforma.",
  },
  edit: {
    title: "Editar usuário",
    description: "Atualize os dados do usuário.",
  },
  view: {
    title: "Detalhes do usuário",
    description: "Informações cadastrais do usuário.",
  },
};

export function UsuarioDialog({
  mode,
  usuario,
  trigger,
}: {
  mode: Mode;
  usuario?: ProfileWithEmail;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [telefone, setTelefone] = useState(() =>
    formatPhone(usuario?.telefone ?? "").replace("—", ""),
  );
  const router = useRouter();

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) setTelefone(formatPhone(usuario?.telefone ?? "").replace("—", ""));
    },
    [usuario?.telefone],
  );

  const readOnly = mode === "view";
  const copy = COPY[mode];

  async function handleSubmit(formData: FormData) {
    const action = mode === "create" ? createUsuario : updateUsuario;
    const result = await action({}, formData);
    if (result?.ok) {
      toast.success(
        mode === "create"
          ? "Usuário criado com sucesso."
          : "Usuário atualizado.",
      );
      setOpen(false);
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form
          action={readOnly ? undefined : handleSubmit}
          className="space-y-4"
        >
          {usuario && <input type="hidden" name="id" value={usuario.id} />}

          <Field label="Nome completo" htmlFor="usuario-nome" required={!readOnly}>
            <Input
              id="usuario-nome"
              name="nome_completo"
              defaultValue={usuario?.nome_completo ?? ""}
              placeholder="Nome completo"
              className="h-11"
              disabled={readOnly}
              required={!readOnly}
            />
          </Field>

          <Field label="E-mail" htmlFor="usuario-email" required={mode === "create"}>
            <Input
              id="usuario-email"
              name="email"
              type="email"
              defaultValue={usuario?.email ?? ""}
              placeholder="email@exemplo.com"
              className="h-11"
              disabled={readOnly || mode === "edit"}
              required={mode === "create"}
            />
          </Field>

          {mode === "create" && (
            <Field
              label="Senha"
              htmlFor="usuario-senha"
              required
              hint="Mínimo de 6 caracteres."
            >
              <Input
                id="usuario-senha"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-11"
                minLength={6}
                required
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Celular" htmlFor="usuario-telefone">
              <Input
                id="usuario-telefone"
                name="telefone"
                value={telefone}
                onChange={(e) =>
                  setTelefone(formatPhone(e.target.value).replace("—", ""))
                }
                placeholder="(00) 00000-0000"
                className="h-11"
                disabled={readOnly}
              />
            </Field>
            <Field label="Cargo" htmlFor="usuario-cargo">
              <NativeSelect
                id="usuario-cargo"
                name="cargo"
                defaultValue={usuario?.cargo ?? ""}
                disabled={readOnly}
              >
                <option value="">Selecione</option>
                <option value="Admin">Admin</option>
                <option value="Gerente">Gerente</option>
                <option value="Vendedor">Vendedor</option>
              </NativeSelect>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {readOnly ? "Fechar" : "Cancelar"}
            </DialogClose>
            {!readOnly && (
              <SubmitButton pendingLabel="Salvando…">
                {mode === "create" ? "Criar usuário" : "Salvar"}
              </SubmitButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
