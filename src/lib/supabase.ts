import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export function createBrowserClient() {
  return createClientComponentClient()
}

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}

export type Database = {
  public: {
    Tables: {
      designs: {
        Row: {
          id: string
          user_id: string
          name: string
          design_data: any
          image_url: string | null
          cut_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          design_data?: any
          image_url?: string | null
          cut_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          design_data?: any
          image_url?: string | null
          cut_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          design_id: string
          printful_order_id: string | null
          stripe_payment_id: string | null
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          design_id: string
          printful_order_id?: string | null
          stripe_payment_id?: string | null
          status?: string
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          design_id?: string
          printful_order_id?: string | null
          stripe_payment_id?: string | null
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
