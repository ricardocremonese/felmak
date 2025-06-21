export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ordens_servico: {
        Row: {
          acessorios_entregues: string | null
          autorizacao_orcamento: number | null
          cliente_bairro: string | null
          cliente_cep: string | null
          cliente_cidade: string | null
          cliente_cpf_cnpj: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_estado: string | null
          cliente_nome: string
          cliente_numero: string | null
          cliente_telefone: string
          created_at: string | null
          data_entrada: string | null
          data_entrega: string | null
          data_prevista: string | null
          defeito_relatado: string
          equipamento_cor: string | null
          equipamento_marca: string
          equipamento_modelo: string | null
          equipamento_serie: string | null
          equipamento_tipo: string
          estado_fisico_entrega: string | null
          foto_equipamento_url: string | null
          id: string
          numero_os: number
          observacoes_tecnico: string | null
          prazo_garantia_dias: number | null
          status: string | null
          tecnico_responsavel: string | null
          testes_realizados: string | null
          updated_at: string | null
          urgencia: boolean | null
          valor_mao_obra: number | null
          valor_pecas: number | null
          valor_total: number | null
        }
        Insert: {
          acessorios_entregues?: string | null
          autorizacao_orcamento?: number | null
          cliente_bairro?: string | null
          cliente_cep?: string | null
          cliente_cidade?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_estado?: string | null
          cliente_nome: string
          cliente_numero?: string | null
          cliente_telefone: string
          created_at?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          data_prevista?: string | null
          defeito_relatado: string
          equipamento_cor?: string | null
          equipamento_marca: string
          equipamento_modelo?: string | null
          equipamento_serie?: string | null
          equipamento_tipo: string
          estado_fisico_entrega?: string | null
          foto_equipamento_url?: string | null
          id?: string
          numero_os?: number
          observacoes_tecnico?: string | null
          prazo_garantia_dias?: number | null
          status?: string | null
          tecnico_responsavel?: string | null
          testes_realizados?: string | null
          updated_at?: string | null
          urgencia?: boolean | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Update: {
          acessorios_entregues?: string | null
          autorizacao_orcamento?: number | null
          cliente_bairro?: string | null
          cliente_cep?: string | null
          cliente_cidade?: string | null
          cliente_cpf_cnpj?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_estado?: string | null
          cliente_nome?: string
          cliente_numero?: string | null
          cliente_telefone?: string
          created_at?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          data_prevista?: string | null
          defeito_relatado?: string
          equipamento_cor?: string | null
          equipamento_marca?: string
          equipamento_modelo?: string | null
          equipamento_serie?: string | null
          equipamento_tipo?: string
          estado_fisico_entrega?: string | null
          foto_equipamento_url?: string | null
          id?: string
          numero_os?: number
          observacoes_tecnico?: string | null
          prazo_garantia_dias?: number | null
          status?: string | null
          tecnico_responsavel?: string | null
          testes_realizados?: string | null
          updated_at?: string | null
          urgencia?: boolean | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      os_comunicacoes: {
        Row: {
          data_comunicacao: string | null
          id: string
          mensagem: string
          os_id: string | null
          tipo: string
        }
        Insert: {
          data_comunicacao?: string | null
          id?: string
          mensagem: string
          os_id?: string | null
          tipo: string
        }
        Update: {
          data_comunicacao?: string | null
          id?: string
          mensagem?: string
          os_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_comunicacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      os_pecas: {
        Row: {
          created_at: string | null
          id: string
          os_id: string | null
          peca_nome: string
          preco_total: number
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          os_id?: string | null
          peca_nome: string
          preco_total: number
          preco_unitario: number
          quantidade?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          os_id?: string | null
          peca_nome?: string
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_pecas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
