export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

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

export type PendingApproval = Database['public']['Tables']['pending_approvals']['Row'];