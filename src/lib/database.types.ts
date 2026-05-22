export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          bairro: string | null
          bubble_id: string
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          comprovante_renda: string[] | null
          cpf: string | null
          created_at: string | null
          created_by: string | null
          data_abertura_empresa: string | null
          data_nascimento: string | null
          email: string | null
          empresa_id: string | null
          estado: string | null
          faturamento_empresa: number | null
          id: string
          is_empresa: boolean | null
          logradouro: string | null
          nome: string | null
          nome_mae: string | null
          numero_end: string | null
          orgao_expedidor: string | null
          razao_social: string | null
          renda_mensal: number | null
          rg: string | null
          telefone: string | null
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          bairro?: string | null
          bubble_id: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          comprovante_renda?: string[] | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          data_abertura_empresa?: string | null
          data_nascimento?: string | null
          email?: string | null
          empresa_id?: string | null
          estado?: string | null
          faturamento_empresa?: number | null
          id?: string
          is_empresa?: boolean | null
          logradouro?: string | null
          nome?: string | null
          nome_mae?: string | null
          numero_end?: string | null
          orgao_expedidor?: string | null
          razao_social?: string | null
          renda_mensal?: number | null
          rg?: string | null
          telefone?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          bairro?: string | null
          bubble_id?: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          comprovante_renda?: string[] | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          data_abertura_empresa?: string | null
          data_nascimento?: string | null
          email?: string | null
          empresa_id?: string | null
          estado?: string | null
          faturamento_empresa?: number | null
          id?: string
          is_empresa?: boolean | null
          logradouro?: string | null
          nome?: string | null
          nome_mae?: string | null
          numero_end?: string | null
          orgao_expedidor?: string | null
          razao_social?: string | null
          renda_mensal?: number | null
          rg?: string | null
          telefone?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          agencia_bancaria: string | null
          bairro: string | null
          banco: Json | null
          bubble_id: string
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          conta_bancaria: string | null
          created_at: string | null
          created_by: string | null
          end_numero: string | null
          estado: string | null
          id: string
          nome: string | null
          razao_social: string | null
          updated_at: string | null
        }
        Insert: {
          agencia_bancaria?: string | null
          bairro?: string | null
          banco?: Json | null
          bubble_id: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta_bancaria?: string | null
          created_at?: string | null
          created_by?: string | null
          end_numero?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          razao_social?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia_bancaria?: string | null
          bairro?: string | null
          banco?: Json | null
          bubble_id?: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta_bancaria?: string | null
          created_at?: string | null
          created_by?: string | null
          end_numero?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          razao_social?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          is_lida: boolean | null
          notificacao: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_lida?: boolean | null
          notificacao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_lida?: boolean | null
          notificacao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      observacoes: {
        Row: {
          bubble_id: string
          created_at: string | null
          created_by: string | null
          id: string
          observacao: string | null
          projeto_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          observacao?: string | null
          projeto_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          observacao?: string | null
          projeto_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anexos: string[] | null
          bubble_id: string | null
          cargo: Database["public"]["Enums"]["user_cargo"] | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nome_completo: string | null
          permissoes: string | null
          telefone: string | null
          updated_at: string | null
          user_signed_up: boolean | null
        }
        Insert: {
          anexos?: string[] | null
          bubble_id?: string | null
          cargo?: Database["public"]["Enums"]["user_cargo"] | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id: string
          nome_completo?: string | null
          permissoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_signed_up?: boolean | null
        }
        Update: {
          anexos?: string[] | null
          bubble_id?: string | null
          cargo?: Database["public"]["Enums"]["user_cargo"] | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome_completo?: string | null
          permissoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_signed_up?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          anexos: string[] | null
          bubble_id: string
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          empresa_id: string | null
          estagio_projeto: string | null
          id: string
          nome_cliente: string | null
          responsavel_id: string | null
          status_projeto: Database["public"]["Enums"]["projeto_status"] | null
          updated_at: string | null
          valor_conta_de_luz: number | null
          valor_kwp: number | null
          valor_previsto: number | null
          vendedor_id: string | null
        }
        Insert: {
          anexos?: string[] | null
          bubble_id: string
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          estagio_projeto?: string | null
          id?: string
          nome_cliente?: string | null
          responsavel_id?: string | null
          status_projeto?: Database["public"]["Enums"]["projeto_status"] | null
          updated_at?: string | null
          valor_conta_de_luz?: number | null
          valor_kwp?: number | null
          valor_previsto?: number | null
          vendedor_id?: string | null
        }
        Update: {
          anexos?: string[] | null
          bubble_id?: string
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          estagio_projeto?: string | null
          id?: string
          nome_cliente?: string | null
          responsavel_id?: string | null
          status_projeto?: Database["public"]["Enums"]["projeto_status"] | null
          updated_at?: string | null
          valor_conta_de_luz?: number | null
          valor_kwp?: number | null
          valor_previsto?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          bubble_id: string
          calculo_juros: number | null
          created_at: string | null
          created_by: string | null
          empresa_id: string | null
          id: string
          id_simulacao: number | null
          parcelas_simulacao: string | null
          taxa_juros: number | null
          updated_at: string | null
          valor_entrada: number | null
          valor_financiado: number | null
          valor_parcelado: number | null
          valor_total: number | null
        }
        Insert: {
          bubble_id: string
          calculo_juros?: number | null
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          id?: string
          id_simulacao?: number | null
          parcelas_simulacao?: string | null
          taxa_juros?: number | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_parcelado?: number | null
          valor_total?: number | null
        }
        Update: {
          bubble_id?: string
          calculo_juros?: number | null
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          id?: string
          id_simulacao?: number | null
          parcelas_simulacao?: string | null
          taxa_juros?: number | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_parcelado?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_empresa_id: { Args: never; Returns: string }
    }
    Enums: {
      projeto_status: "Pendente" | "Pré-aprovado" | "Reprovado"
      user_cargo: "Admin" | "Gerente" | "Vendedor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      projeto_status: ["Pendente", "Pré-aprovado", "Reprovado"],
      user_cargo: ["Admin", "Gerente", "Vendedor"],
    },
  },
} as const
