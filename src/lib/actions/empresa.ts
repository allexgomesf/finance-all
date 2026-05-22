"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getEmpresa } from "@/lib/data/empresa";
import { getDigits, getText } from "@/lib/form-utils";

export type EmpresaFormState = { ok?: boolean; error?: string };

export async function updateEmpresa(
  _prev: EmpresaFormState,
  formData: FormData,
): Promise<EmpresaFormState> {
  const empresa = await getEmpresa();
  if (!empresa) {
    return { error: "Nenhuma empresa vinculada à sua conta." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      razao_social: getText(formData, "razao_social"),
      nome: getText(formData, "nome"),
      cnpj: getDigits(formData, "cnpj"),
      cep: getDigits(formData, "cep"),
      end_numero: getText(formData, "end_numero"),
      complemento: getText(formData, "complemento"),
      bairro: getText(formData, "bairro"),
      cidade: getText(formData, "cidade"),
      estado: getText(formData, "estado"),
      banco: getText(formData, "banco"),
      agencia_bancaria: getText(formData, "agencia_bancaria"),
      conta_bancaria: getText(formData, "conta_bancaria"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", empresa.id);

  if (error) {
    return { error: "Não foi possível salvar os dados da empresa." };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
