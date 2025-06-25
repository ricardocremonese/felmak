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
      administracao_addfuncionario: {
        Row: {
          cell_phone: string
          created_at: string
          creci_number: string | null
          full_name: string
          hire_date: string
          id: string
          organization_id: string | null
          personal_email: string
          photo_url: string | null
          role: string
          supervisor: string | null
          updated_at: string
        }
        Insert: {
          cell_phone: string
          created_at?: string
          creci_number?: string | null
          full_name: string
          hire_date: string
          id?: string
          organization_id?: string | null
          personal_email: string
          photo_url?: string | null
          role: string
          supervisor?: string | null
          updated_at?: string
        }
        Update: {
          cell_phone?: string
          created_at?: string
          creci_number?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          organization_id?: string | null
          personal_email?: string
          photo_url?: string | null
          role?: string
          supervisor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cadastrar_imovel: {
        Row: {
          address: string | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          built_area: number | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          land_area: number | null
          neighborhood: string | null
          organization_id: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          parking_spaces: number | null
          price: number | null
          state: string | null
          title: string
          total_area: number | null
          transaction_type: string | null
          type: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          land_area?: number | null
          neighborhood?: string | null
          organization_id?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          price?: number | null
          state?: string | null
          title: string
          total_area?: number | null
          transaction_type?: string | null
          type: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          land_area?: number | null
          neighborhood?: string | null
          organization_id?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          price?: number | null
          state?: string | null
          title?: string
          total_area?: number | null
          transaction_type?: string | null
          type?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastrar_imovel_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string
          address_number: string
          cep: string
          city: string
          cnpj: string
          company_logo: string | null
          company_name: string
          complement: string | null
          created_at: string
          email: string
          id: string
          neighborhood: string
          organization_id: string | null
          phone: string
          registration_date: string
          responsible_name: string
          state: string
          updated_at: string
        }
        Insert: {
          address: string
          address_number: string
          cep: string
          city: string
          cnpj: string
          company_logo?: string | null
          company_name: string
          complement?: string | null
          created_at?: string
          email: string
          id?: string
          neighborhood: string
          organization_id?: string | null
          phone: string
          registration_date?: string
          responsible_name: string
          state: string
          updated_at?: string
        }
        Update: {
          address?: string
          address_number?: string
          cep?: string
          city?: string
          cnpj?: string
          company_logo?: string | null
          company_name?: string
          complement?: string | null
          created_at?: string
          email?: string
          id?: string
          neighborhood?: string
          organization_id?: string | null
          phone?: string
          registration_date?: string
          responsible_name?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          cell_phone: string
          created_at: string | null
          creci_number: string | null
          full_name: string
          hire_date: string
          id: string
          login: string
          organization_id: string | null
          password: string
          personal_email: string
          photo_url: string | null
          role: string
          supervisor: string | null
          updated_at: string | null
        }
        Insert: {
          cell_phone: string
          created_at?: string | null
          creci_number?: string | null
          full_name: string
          hire_date: string
          id?: string
          login: string
          organization_id?: string | null
          password: string
          personal_email: string
          photo_url?: string | null
          role: string
          supervisor?: string | null
          updated_at?: string | null
        }
        Update: {
          cell_phone?: string
          created_at?: string | null
          creci_number?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          login?: string
          organization_id?: string | null
          password?: string
          personal_email?: string
          photo_url?: string | null
          role?: string
          supervisor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_tokens: {
        Row: {
          access_token: string
          user_id: string
        }
        Insert: {
          access_token: string
          user_id: string
        }
        Update: {
          access_token?: string
          user_id?: string
        }
        Relationships: []
      }
      gerenciar_proprietario: {
        Row: {
          cep: string | null
          city: string | null
          complement: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          organization_id: string | null
          phone: string
          property_name: string | null
          property_type: string | null
          registered_property_id: string | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          organization_id?: string | null
          phone: string
          property_name?: string | null
          property_type?: string | null
          registered_property_id?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          organization_id?: string | null
          phone?: string
          property_name?: string | null
          property_type?: string | null
          registered_property_id?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gerenciar_proprietario_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gerenciar_proprietario_registered_property_id_fkey"
            columns: ["registered_property_id"]
            isOneToOne: false
            referencedRelation: "cadastrar_imovel"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_tokens: {
        Row: {
          access_token: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_agent: string | null
          created_at: string | null
          email: string
          id: string
          last_contact_date: string | null
          lead_source: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          property_interest_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          property_interest_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          property_interest_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          max_properties: number | null
          max_users: number | null
          name: string
          slug: string
          subscription_expires_at: string | null
          subscription_plan: string
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          max_properties?: number | null
          max_users?: number | null
          name: string
          slug: string
          subscription_expires_at?: string | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          max_properties?: number | null
          max_users?: number | null
          name?: string
          slug?: string
          subscription_expires_at?: string | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      parceiros: {
        Row: {
          bairros_atuacao: string[] | null
          ceps_atuacao: string[] | null
          created_at: string
          email: string
          especializacao: string | null
          id: string
          nome_completo: string
          numero_creci: string | null
          organization_id: string | null
          regioes_atuacao: string[] | null
          taxa_comissao: number
          telefone: string
          tipo_parceiro: string
          updated_at: string
        }
        Insert: {
          bairros_atuacao?: string[] | null
          ceps_atuacao?: string[] | null
          created_at?: string
          email: string
          especializacao?: string | null
          id?: string
          nome_completo: string
          numero_creci?: string | null
          organization_id?: string | null
          regioes_atuacao?: string[] | null
          taxa_comissao?: number
          telefone: string
          tipo_parceiro: string
          updated_at?: string
        }
        Update: {
          bairros_atuacao?: string[] | null
          ceps_atuacao?: string[] | null
          created_at?: string
          email?: string
          especializacao?: string | null
          id?: string
          nome_completo?: string
          numero_creci?: string | null
          organization_id?: string | null
          regioes_atuacao?: string[] | null
          taxa_comissao?: number
          telefone?: string
          tipo_parceiro?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_sales: {
        Row: {
          commission_amount: number
          created_at: string | null
          id: string
          partner_id: string
          sale_id: string
        }
        Insert: {
          commission_amount: number
          created_at?: string | null
          id?: string
          partner_id: string
          sale_id: string
        }
        Update: {
          commission_amount?: number
          created_at?: string | null
          id?: string
          partner_id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_sales_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_rate: number
          created_at: string | null
          email: string
          id: string
          license_number: string | null
          name: string
          neighborhoods: string[] | null
          organization_id: string | null
          partner_type: string
          phone: string
          regions: string[] | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          commission_rate: number
          created_at?: string | null
          email: string
          id?: string
          license_number?: string | null
          name: string
          neighborhoods?: string[] | null
          organization_id?: string | null
          partner_type: string
          phone: string
          regions?: string[] | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          email?: string
          id?: string
          license_number?: string | null
          name?: string
          neighborhoods?: string[] | null
          organization_id?: string | null
          partner_type?: string
          phone?: string
          regions?: string[] | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_organization_id: string | null
          document: string | null
          email: string | null
          full_name: string | null
          id: string
          is_first_login: boolean | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          current_organization_id?: string | null
          document?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_first_login?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          current_organization_id?: string | null
          document?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_first_login?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          area: number | null
          assigned_partner_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_area: number | null
          city: string
          commercial_type: string | null
          complement: string | null
          condominium_fee: number | null
          condominium_value: number | null
          created_at: string
          description: string | null
          floor: string | null
          floor_number: number | null
          front_width: number | null
          has_condominium: string | null
          has_elevator: boolean | null
          has_pool: boolean | null
          id: string
          images: string[] | null
          iptu_value: number | null
          is_corner_lot: boolean | null
          land_area: number | null
          neighborhood: string
          number: string
          organization_id: string | null
          parking_spaces: number | null
          price: number
          property_code: string
          state: string
          suites: number | null
          title: string
          topography: string | null
          type: string
          updated_at: string
          zip_code: string | null
          zoning: string | null
        }
        Insert: {
          address: string
          area?: number | null
          assigned_partner_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city: string
          commercial_type?: string | null
          complement?: string | null
          condominium_fee?: number | null
          condominium_value?: number | null
          created_at?: string
          description?: string | null
          floor?: string | null
          floor_number?: number | null
          front_width?: number | null
          has_condominium?: string | null
          has_elevator?: boolean | null
          has_pool?: boolean | null
          id?: string
          images?: string[] | null
          iptu_value?: number | null
          is_corner_lot?: boolean | null
          land_area?: number | null
          neighborhood: string
          number: string
          organization_id?: string | null
          parking_spaces?: number | null
          price: number
          property_code: string
          state: string
          suites?: number | null
          title: string
          topography?: string | null
          type: string
          updated_at?: string
          zip_code?: string | null
          zoning?: string | null
        }
        Update: {
          address?: string
          area?: number | null
          assigned_partner_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string
          commercial_type?: string | null
          complement?: string | null
          condominium_fee?: number | null
          condominium_value?: number | null
          created_at?: string
          description?: string | null
          floor?: string | null
          floor_number?: number | null
          front_width?: number | null
          has_condominium?: string | null
          has_elevator?: boolean | null
          has_pool?: boolean | null
          id?: string
          images?: string[] | null
          iptu_value?: number | null
          is_corner_lot?: boolean | null
          land_area?: number | null
          neighborhood?: string
          number?: string
          organization_id?: string | null
          parking_spaces?: number | null
          price?: number
          property_code?: string
          state?: string
          suites?: number | null
          title?: string
          topography?: string | null
          type?: string
          updated_at?: string
          zip_code?: string | null
          zoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_assigned_partner_id_fkey"
            columns: ["assigned_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          property_name: string
          property_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          property_name: string
          property_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          property_name?: string
          property_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_owners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          commission: number
          created_at: string | null
          date: string
          id: string
          organization_id: string | null
          property_price: number
          property_title: string
          updated_at: string | null
        }
        Insert: {
          commission: number
          created_at?: string | null
          date: string
          id?: string
          organization_id?: string | null
          property_price: number
          property_title: string
          updated_at?: string | null
        }
        Update: {
          commission?: number
          created_at?: string | null
          date?: string
          id?: string
          organization_id?: string | null
          property_price?: number
          property_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_main_functions: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          display_order: number
          icon_name: string | null
          id: string
          name: string
          route: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order: number
          icon_name?: string | null
          id?: string
          name: string
          route: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          name?: string
          route?: string
        }
        Relationships: []
      }
      system_management_features: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          display_order: number
          icon_name: string | null
          id: string
          name: string
          route: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order: number
          icon_name?: string | null
          id?: string
          name: string
          route: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          name?: string
          route?: string
        }
        Relationships: []
      }
      tiktok_ads_tokens: {
        Row: {
          access_token: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          notes: string | null
          organization_id: string | null
          property_id: string
          schedule_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          organization_id?: string | null
          property_id: string
          schedule_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          organization_id?: string | null
          property_id?: string
          schedule_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization: {
        Args: { org_name: string; org_slug: string }
        Returns: string
      }
      get_current_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_organization_member: {
        Args: { org_id: string }
        Returns: boolean
      }
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
