// Add this to the Database type definition in the existing types.ts file
// This should be added to the public.Tables section

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
}