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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deals: {
        Row: {
          address: string | null
          advance_commission: number | null
          advance_date: string | null
          buyer_type: string | null
          city: string | null
          client_name: string
          close_date_actual: string | null
          close_date_est: string | null
          completion_commission: number | null
          completion_date: string | null
          created_at: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          gross_commission_actual: number | null
          gross_commission_est: number | null
          id: string
          lead_source: string | null
          listing_date: string | null
          net_commission_actual: number | null
          net_commission_est: number | null
          notes: string | null
          pending_date: string | null
          project_name: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          sale_price: number | null
          status: Database["public"]["Enums"]["deal_status"]
          team_member: string | null
          team_member_portion: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          advance_commission?: number | null
          advance_date?: string | null
          buyer_type?: string | null
          city?: string | null
          client_name: string
          close_date_actual?: string | null
          close_date_est?: string | null
          completion_commission?: number | null
          completion_date?: string | null
          created_at?: string
          deal_type: Database["public"]["Enums"]["deal_type"]
          gross_commission_actual?: number | null
          gross_commission_est?: number | null
          id?: string
          lead_source?: string | null
          listing_date?: string | null
          net_commission_actual?: number | null
          net_commission_est?: number | null
          notes?: string | null
          pending_date?: string | null
          project_name?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          sale_price?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          team_member?: string | null
          team_member_portion?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          advance_commission?: number | null
          advance_date?: string | null
          buyer_type?: string | null
          city?: string | null
          client_name?: string
          close_date_actual?: string | null
          close_date_est?: string | null
          completion_commission?: number | null
          completion_date?: string | null
          created_at?: string
          deal_type?: Database["public"]["Enums"]["deal_type"]
          gross_commission_actual?: number | null
          gross_commission_est?: number | null
          id?: string
          lead_source?: string | null
          listing_date?: string | null
          net_commission_actual?: number | null
          net_commission_est?: number | null
          notes?: string | null
          pending_date?: string | null
          project_name?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          sale_price?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          team_member?: string | null
          team_member_portion?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          month: string
          notes: string | null
          recurrence: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          recurrence?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          recurrence?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      other_income: {
        Row: {
          amount: number
          created_at: string
          end_month: string | null
          id: string
          name: string
          notes: string | null
          recurrence: string
          start_month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          end_month?: string | null
          id?: string
          name: string
          notes?: string | null
          recurrence?: string
          start_month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_month?: string | null
          id?: string
          name?: string
          notes?: string | null
          recurrence?: string
          start_month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          custom_type_name: string | null
          deal_id: string
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payout_type: Database["public"]["Enums"]["payout_type"]
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          custom_type_name?: string | null
          deal_id: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payout_type: Database["public"]["Enums"]["payout_type"]
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          custom_type_name?: string | null
          deal_id?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payout_type?: Database["public"]["Enums"]["payout_type"]
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          apply_tax_to_forecasts: boolean
          brokerage_split_percent: number | null
          country: string | null
          created_at: string
          currency: string
          id: string
          monthly_income_goal: number | null
          presale_template: Json | null
          province: string | null
          resale_template: Json | null
          tax_set_aside_percent: number | null
          tax_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apply_tax_to_forecasts?: boolean
          brokerage_split_percent?: number | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          monthly_income_goal?: number | null
          presale_template?: Json | null
          province?: string | null
          resale_template?: Json | null
          tax_set_aside_percent?: number | null
          tax_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apply_tax_to_forecasts?: boolean
          brokerage_split_percent?: number | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          monthly_income_goal?: number | null
          presale_template?: Json | null
          province?: string | null
          resale_template?: Json | null
          tax_set_aside_percent?: number | null
          tax_type?: string | null
          updated_at?: string
          user_id?: string
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
      deal_status: "PENDING" | "CLOSED"
      deal_type: "BUY" | "SELL"
      payout_status: "PROJECTED" | "INVOICED" | "PAID"
      payout_type:
        | "Advance"
        | "2nd Payment"
        | "3rd Deposit"
        | "4th Deposit"
        | "Completion"
        | "Custom"
      property_type: "PRESALE" | "RESALE"
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
      deal_status: ["PENDING", "CLOSED"],
      deal_type: ["BUY", "SELL"],
      payout_status: ["PROJECTED", "INVOICED", "PAID"],
      payout_type: [
        "Advance",
        "2nd Payment",
        "3rd Deposit",
        "4th Deposit",
        "Completion",
        "Custom",
      ],
      property_type: ["PRESALE", "RESALE"],
    },
  },
} as const
