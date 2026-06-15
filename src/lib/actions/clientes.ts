"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId } from "@/lib/data/session";
import {
  getBool,
  getDigits,
  getNumber,
  getStr,
  getText,
} from "@/lib/form-utils";

export type ClienteFormState = { error?: string };

function clientePayload(formData: FormData) {
  return {
    is_empresa: getBool(formData, "is_empresa"),
    nome: getText(formData, "nome"),
    razao_social: getText(formData, "razao_social"),
    cpf: getDigits(formData, "cpf"),
    cnpj: getDigits(formData, "cnpj"),
    rg: getText(formData, "rg"),
    orgao_expedidor: getText(formData, "orgao_expedidor"),
    nome_mae: getText(formData, "nome_mae"),
    data_nascimento: getText(formData, "data_nascimento"),
    data_abertura_empresa: getText(formData, "data_abertura_empresa"),
    socio_nome: getText(formData, "socio_nome"),
    socio_data_nascimento: getText(formData, "socio_data_nascimento"),
    socio_nome_mae: getText(formData, "socio_nome_mae"),
    renda_mensal: getNumber(formData, "renda_mensal"),
    faturamento_empresa: getNumber(formData, "faturamento_empresa"),
    email: getText(formData, "email"),
    telefone: getDigits(formData, "telefone"),
    cep: getDigits(formData, "cep"),
    logradouro: getText(formData, "logradouro"),
    numero_end: getText(formData, "numero_end"),
    complemento: getText(formData, "complemento"),
    bairro: getText(formData, "bairro"),
    cidade: getText(formData, "cidade"),
    estado: getText(formData, "estado"),
    vendedor_id: getText(formData, "vendedor_id"),
    updated_at: new Date().toISOString(),
  };
}

export async function createCliente(
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const payload = clientePayload(formData);
  if (!payload.nome && !payload.razao_social) {
    return { error: "Informe o nome do cliente." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empresaId = await getCurrentEmpresaId();

  const { error } = await supabase.from("clientes").insert({
    ...payload,
    bubble_id: crypto.randomUUID(),
    empresa_id: empresaId,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o cliente." };
  }

  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/clientes");
}

export async function updateCliente(
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const id = getStr(formData, "id");
  if (!id) return { error: "Cliente inválido." };

  const payload = clientePayload(formData);
  if (!payload.nome && !payload.razao_social) {
    return { error: "Informe o nome do cliente." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  redirect("/dashboard/clientes");
}

export async function deleteCliente(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard", "layout");
}
