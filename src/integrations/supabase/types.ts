import type { Json } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      pending_approvals: {
        Row: {
          id: string;
          type: string;
          data: Json;
          created_by: string;
          created_by_name: string | null;
          created_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          type: string;
          data: Json;
          created_by: string;
          created_by_name?: string | null;
          created_at?: string;
          status?: string;
        };
        Update: {
          id?: string;
          type?: string;
          data?: Json;
          created_by?: string;
          created_by_name?: string | null;
          created_at?: string;
          status?: string;
        };
        Relationships: [];
      };
    };
  };
}