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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ordens_servico: {
        Row: {
          acessorios_entregues: string | null
          acompanha_acessorios: boolean | null
          acessorios_descricao: string | null
          aceita_clausulas: boolean | null
          aplicar_taxa_orcamento: boolean | null
          assinatura_cliente: string | null
          autorizacao_orcamento: boolean | null
          avaliacao_total: boolean | null
          cliente_bairro: string | null
          cliente_cep: string | null
          cliente_cidade: string | null
          cliente_cpf_cnpj: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_estado: string | null
          cliente_nome: string
          cliente_numero: string | null
          cliente_telefone: string | null
          codigo_item: string | null
          created_at: string
          data_conclusao: string | null
          data_entrada: string
          data_entrega: string | null
          data_previsao: string | null
          data_prevista: string | null
          data_ultima_alteracao_status: string | null
          defeito_relatado: string
          equipamento_cor: string | null
          equipamento_funciona_defeito: boolean | null
          equipamento_marca: string | null
          equipamento_modelo: string | null
          equipamento_serie: string | null
          equipamento_tipo: string
          estado_fisico_entrega: string | null
          id: string
          numero_os: number
          observacoes: string | null
          observacoes_tecnico: string | null
          observacoes_tecnico_antes: string | null
          observacoes_tecnico_depois: string | null
          pecas_orcamento: string | null
          prazo_garantia_dias: number | null
          prioridade: string
          status: string
          tecnico_responsavel: string | null
          tem_valor_antecipado: boolean | null
          testes_realizados: string | null
          updated_at: string
          valor_antecipado: number | null
          valor_mao_obra: number | null
          valor_pecas: number | null
          valor_servico: number | null
          valor_taxa_orcamento: number | null
          valor_total: number | null
        }
        Insert: {
          acessorios_entregues?: string | null
          acompanha_acessorios?: boolean | null
          acessorios_descricao?: string | null
          aceita_clausulas?: boolean | null
          aplicar_taxa_orcamento?: boolean | null
          assinatura_cliente?: string | null
          autorizacao_orcamento?: boolean | null
          avaliacao_total?: boolean | null
          cliente_bairro?: string | null
          cliente_cep?: string | null
          cliente_cidade?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_estado?: string | null
          cliente_nome: string
          cliente_numero?: string | null
          cliente_telefone?: string | null
          codigo_item?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_entrada?: string
          data_entrega?: string | null
          data_previsao?: string | null
          data_prevista?: string | null
          data_ultima_alteracao_status?: string | null
          defeito_relatado: string
          equipamento_cor?: string | null
          equipamento_funciona_defeito?: boolean | null
          equipamento_marca?: string | null
          equipamento_modelo?: string | null
          equipamento_serie?: string | null
          equipamento_tipo: string
          estado_fisico_entrega?: string | null
          id?: string
          numero_os?: number
          observacoes?: string | null
          observacoes_tecnico?: string | null
          observacoes_tecnico_antes?: string | null
          observacoes_tecnico_depois?: string | null
          pecas_orcamento?: string | null
          prazo_garantia_dias?: number | null
          prioridade?: string
          status?: string
          tecnico_responsavel?: string | null
          tem_valor_antecipado?: boolean | null
          testes_realizados?: string | null
          updated_at?: string
          valor_antecipado?: number | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_servico?: number | null
          valor_taxa_orcamento?: number | null
          valor_total?: number | null
        }
        Update: {
          acessorios_entregues?: string | null
          acompanha_acessorios?: boolean | null
          acessorios_descricao?: string | null
          aceita_clausulas?: boolean | null
          aplicar_taxa_orcamento?: boolean | null
          assinatura_cliente?: string | null
          autorizacao_orcamento?: boolean | null
          avaliacao_total?: boolean | null
          cliente_bairro?: string | null
          cliente_cep?: string | null
          cliente_cidade?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_estado?: string | null
          cliente_nome?: string
          cliente_numero?: string | null
          cliente_telefone?: string | null
          codigo_item?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_entrada?: string
          data_entrega?: string | null
          data_previsao?: string | null
          data_prevista?: string | null
          data_ultima_alteracao_status?: string | null
          defeito_relatado?: string
          equipamento_cor?: string | null
          equipamento_funciona_defeito?: boolean | null
          equipamento_marca?: string | null
          equipamento_modelo?: string | null
          equipamento_serie?: string | null
          equipamento_tipo?: string
          estado_fisico_entrega?: string | null
          id?: string
          numero_os?: number
          observacoes?: string | null
          observacoes_tecnico?: string | null
          observacoes_tecnico_antes?: string | null
          observacoes_tecnico_depois?: string | null
          pecas_orcamento?: string | null
          prazo_garantia_dias?: number | null
          prioridade?: string
          status?: string
          tecnico_responsavel?: string | null
          tem_valor_antecipado?: boolean | null
          testes_realizados?: string | null
          updated_at?: string
          valor_antecipado?: number | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_servico?: number | null
          valor_taxa_orcamento?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      pecas_materiais: {
        Row: {
          created_at: string
          id: string
          os_id: string | null
          peca_nome: string
          preco_total: number
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          os_id?: string | null
          peca_nome: string
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
        }
        Update: {
          created_at?: string
          id?: string
          os_id?: string | null
          peca_nome?: string
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pecas_materiais_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
