export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  empresa: string;
  cidade: string;
  status: string;
  observacao: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EditableLeadField =
  | "nome"
  | "telefone"
  | "empresa"
  | "cidade"
  | "status"
  | "observacao";

export type LeadInsertPayload = {
  nome: string;
  telefone?: string;
  empresa?: string;
  cidade?: string;
  status?: string;
  observacao?: string;
  created_by?: string;
};

export type LeadUpdatePayload = Partial<
  Pick<Lead, EditableLeadField | "updated_at">
>;

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: {
          id?: string;
          nome: string;
          telefone?: string;
          empresa?: string;
          cidade?: string;
          status?: string;
          observacao?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string;
          empresa?: string;
          cidade?: string;
          status?: string;
          observacao?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
