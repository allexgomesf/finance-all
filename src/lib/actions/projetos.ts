"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentEmpresaId } from "@/lib/data/session";
import { getNumber, getStr, getText } from "@/lib/form-utils";

export type ProjetoFormState = { error?: string };

const STATUS = ["Pendente", "Pré-aprovado", "Reprovado"] as const;
type ProjetoStatus = (typeof STATUS)[number];

function getStatus(formData: FormData): ProjetoStatus | null {
  const value = getStr(formData, "status_projeto");
  return (STATUS as readonly string[]).includes(value)
    ? (value as ProjetoStatus)
    : null;
}

function projetoPayload(formData: FormData) {
  return {
    cliente_id: getText(formData, "cliente_id"),
    vendedor_id: getText(formData, "vendedor_id"),
    responsavel_id: getText(formData, "responsavel_id"),
    valor_previsto: getNumber(formData, "valor_previsto"),
    valor_kwp: getNumber(formData, "valor_kwp"),
    valor_conta_de_luz: getNumber(formData, "valor_conta_de_luz"),
    estagio_projeto: getText(formData, "estagio_projeto"),
    status_projeto: getStatus(formData),
    updated_at: new Date().toISOString(),
  };
}

export async function createProjeto(
  _prev: ProjetoFormState,
  formData: FormData,
): Promise<ProjetoFormState> {
  const payload = projetoPayload(formData);
  if (!payload.cliente_id) {
    return { error: "Selecione o cliente do projeto." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empresaId = await getCurrentEmpresaId();

  const { error } = await supabase.from("projetos").insert({
    ...payload,
    bubble_id: crypto.randomUUID(),
    empresa_id: empresaId,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o projeto." };
  }

  revalidatePath("/dashboard/projetos");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/projetos");
}

export async function updateProjeto(
  _prev: ProjetoFormState,
  formData: FormData,
): Promise<ProjetoFormState> {
  const id = getStr(formData, "id");
  if (!id) return { error: "Projeto inválido." };

  const payload = projetoPayload(formData);
  if (!payload.cliente_id) {
    return { error: "Selecione o cliente do projeto." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projetos")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/dashboard/projetos");
  revalidatePath(`/dashboard/projetos/${id}`);
  redirect("/dashboard/projetos");
}

export async function deleteProjeto(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("projetos").delete().eq("id", id);
  revalidatePath("/dashboard/projetos");
  revalidatePath("/dashboard", "layout");
}

export async function updateEstagioAction(
  projetoId: string,
  novoEstagio: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projetos")
    .update({ estagio_projeto: novoEstagio, updated_at: new Date().toISOString() })
    .eq("id", projetoId);

  if (error) return { error: "Não foi possível atualizar o estágio." };

  revalidatePath(`/dashboard/projetos/${projetoId}`);
  return {};
}

export type ObservacaoFormState = { error?: string };

export async function addObservacaoAction(
  _prev: ObservacaoFormState,
  formData: FormData,
): Promise<ObservacaoFormState> {
  const projetoId = getStr(formData, "projeto_id");
  const observacao = getText(formData, "observacao");

  if (!projetoId) return { error: "Projeto inválido." };
  if (!observacao) return { error: "Escreva uma observação antes de enviar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("observacoes").insert({
    bubble_id: crypto.randomUUID(),
    projeto_id: projetoId,
    observacao,
    user_id: user?.id ?? null,
    created_by: user?.id ?? null,
  });

  if (error) return { error: "Não foi possível salvar a observação." };

  revalidatePath(`/dashboard/projetos/${projetoId}`);
  return {};
}

export type AnexoFormState = { error?: string };

export async function uploadAnexoAction(
  _prev: AnexoFormState,
  formData: FormData,
): Promise<AnexoFormState> {
  const projetoId = getStr(formData, "projeto_id");
  const file = formData.get("arquivo") as File | null;

  if (!projetoId) return { error: "Projeto inválido." };
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };
  if (file.size > 52_428_800) return { error: "Arquivo muito grande (máx. 50 MB)." };

  const empresaId = await getCurrentEmpresaId();
  const ext = file.name.split(".").pop() ?? "";
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const path = `${empresaId}/${projetoId}/${safeName}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("projeto-anexos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: "Falha no upload do arquivo." };

  // Append path to projetos.anexos array
  const supabase = await createClient();
  const { data: proj } = await supabase
    .from("projetos")
    .select("anexos")
    .eq("id", projetoId)
    .maybeSingle();

  const currentAnexos = (proj?.anexos as string[] | null) ?? [];
  const { error: updateError } = await supabase
    .from("projetos")
    .update({ anexos: [...currentAnexos, path], updated_at: new Date().toISOString() })
    .eq("id", projetoId);

  if (updateError) {
    await admin.storage.from("projeto-anexos").remove([path]);
    return { error: "Falha ao registrar o arquivo no projeto." };
  }

  revalidatePath(`/dashboard/projetos/${projetoId}`);
  return {};
}

export async function deleteAnexoAction(
  projetoId: string,
  path: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin.storage.from("projeto-anexos").remove([path]);

  const supabase = await createClient();
  const { data: proj } = await supabase
    .from("projetos")
    .select("anexos")
    .eq("id", projetoId)
    .maybeSingle();

  const currentAnexos = (proj?.anexos as string[] | null) ?? [];
  await supabase
    .from("projetos")
    .update({
      anexos: currentAnexos.filter((p) => p !== path),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projetoId);

  revalidatePath(`/dashboard/projetos/${projetoId}`);
}
